import * as fs from "fs";
import { Msg } from "./util/msg";
import * as OTPAuth from "otpauth";
import { Logger } from "./util/logger";
import { VRChat } from "./vrchat";
import { Discord } from "./discord";
import { FANBOX } from "./fanbox";
import { threadId } from "worker_threads";
import { GroupRoleApplyTask } from "./task/GroupRoleApplyTask";
import { UserRepositoryFactory } from "./db/factories/UserRepositoryFactory";
import { GetUserInfoService } from "./db/services/GetUserInfoService";
import { GetFanboxRelationshipTask } from "./task/GetFanboxRelationship";
import { GetVRChatLinkInfo } from "./task/GetVRChatLinkInfo";
import { CheckApplyUserTask } from "./task/CheckApplyUser";
import { UpdateSupporterListTask } from "./task/UpdateSupporterList";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();
const bodyParser = require('body-parser');
const port = process.env.PORT || config.serverPort || 36578;
const TestDataPort = process.env.PORT || config.TestDataPort || 36579;
const wsPort = process.env.PORT || config.websocketPort || 3000;
const package_json = require('../package.json');
const isProxy = Boolean(process.env.IS_PROXY) || config.isPorxy || false;
const express = require('express');
const app = express();
let server = null;
const endpoint = "/eewext";
const res = require('express/lib/response');

if (package_json.name == "template") {
    process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

console.log("///////////////////////////////////////////////");
console.log("       " + package_json.name + " v" + package_json.version);
console.log("///////////////////////////////////////////////");

if (!fs.existsSync("secret")) {
    fs.mkdirSync("secret");
}

const DEBUGLOG = (sender, value) => {
    if (!config.debug) return;
    console.log("[" + sender + "]--------");
    console.log(value);
}

let totpObj: OTPAuth.TOTP | OTPAuth.HOTP = null;

if (config.authentication.vrchat.OTP != null && config.authentication.vrchat.OTP.URI != null) {
    totpObj = OTPAuth.URI.parse(config.authentication.vrchat.OTP.URI);
}

const userAgent = package_json.name + "/v" + package_json.version + " " + package_json.github + " " + config.contact;



const Main = async () => {

    Logger.level = config.logLevel || "info";
    let logger = new Logger("Main");

    logger.info("-------");
    logger.info("");
    logger.info("starting " + package_json.name + " v" + package_json.version);

    let discord = new Discord(config.noticeService.discord.webhookUrl);
    let fanbox = new FANBOX(
        config.authentication.fanbox.cookies,
        config.authentication.fanbox.userAgent
    );


    const repo = new GetUserInfoService(UserRepositoryFactory.create());

    const vrchat = new VRChat(
        config.apiKey,
        config.authentication.vrchat.email,
        config.authentication.vrchat.password,
        package_json.name + "/v" + package_json.version + " " + package_json.github + " " + config.contact,
        "secret",
        config.authentication.vrchat.OTP != null && config.authentication.vrchat.OTP.URI != null ? config.authentication.vrchat.OTP.URI : null,
    );

    let isLogin = false;

    await vrchat.LoginCheck().then((result) => {
        isLogin = vrchat.isLogin;
    }).catch((e) => {
        logger.info("LoginCheck: " + e);
        isLogin = false;
    });

    logger.info("Login check: " + Msg.YesNo(isLogin));

    if (!isLogin) {
        await vrchat.Login().then(async (result) => {
            if (result.requiresTwoFactorAuth) {
                await vrchat.TwoFactorAuth();
            }
        });
    }

    if (!vrchat.isLogin) {
        logger.info("Login failed...");

    } else {
        logger.info("Login Success!");
    }

    const supportersFunc = async (supporters) => {
        logger.debug("GetFanboxRelationshipTask start");
        for (const planId in supporters) {
            logger.debug("[plan: " + planId + "] start");
            const supporterList = supporters[planId];
            for (const supporter of supporterList) {
                const pixivUserId = supporter.userId;
                if (pixivUserId != null) {
                    repo.getUserInfoByPixivId(pixivUserId).then(async (user) => {
                        if (user != null) {
                            await repo.updateUser(
                                user.userId,
                                { fanboxPlanId: planId }
                            );
                            logger.info("Updated user: " + supporter.name + " (" + supporter.userId + ") -> " + planId);
                        } else {
                            await repo.registerUser(
                                "",
                                supporter.userId,
                                "",
                                planId
                            );
                            logger.info("Registered user: " + supporter.name + " (" + supporter.userId + ") -> " + planId);
                        }

                    }).catch((e) => {
                        logger.error("GetFanboxRelationshipTask Error: " + e);
                        discord.sendMessage("GetFanboxRelationshipTask Error: " + e);
                    });
                }
            }

        }
    };

    const getFanboxRelationshipTask = new GetFanboxRelationshipTask(
        fanbox,
        config.settings.fanbox.coolTime,
        supportersFunc,
        (e) => {
            logger.error("GetFanboxRelationshipTask Error: " + e);
            discord.sendMessage("GetFanboxRelationshipTask Error: " + e);
        }
    );

    getFanboxRelationshipTask.start();

    const getVRChatLinkInfo = new GetVRChatLinkInfo(
        config.settings.spreadsheet.coolTime,
        (e) => {
            logger.error("GetVRChatLinkInfo Error: " + e);
            discord.sendMessage("GroupRoleApplyTask Error: " + e);
        }
    );

    getVRChatLinkInfo.start();

    const groupRoleApplyTask = new GroupRoleApplyTask(
        vrchat,
        (e) => {
            logger.error("GroupRoleApplyTask Error: " + e);
            discord.sendMessage("GroupRoleApplyTask Error: " + e);
        }
    );

    groupRoleApplyTask.start();

    const checkApplyUsertask = new CheckApplyUserTask(
        groupRoleApplyTask,
        config.settings.vrchat.coolTime,
        (e) => {
            logger.error("GetVRChatLinkInfo Error: " + e);
            discord.sendMessage("GetVRChatLinkInfo Error: " + e);
        }
    );

    const updateSupporterList = new UpdateSupporterListTask((e) => {
        logger.error("UpdateSupporterListTask Error: " + e);
        discord.sendMessage("UpdateSupporterListTask Error: " + e);
    });

    setTimeout(() => {
        checkApplyUsertask.start();
    }, 1000 * 60 * 2); 

    setTimeout(() => {
        updateSupporterList.start();
    }, 1000 * 60 * 4); 

    const exitProcess = async () => {
        console.log("Exitting...");
        if (server != null) server.close();
    }

    process.on("SIGINT", async () => {
        await exitProcess();
        process.exit(0);
    });

    app.use(express.static('public'));

    app.use("/js", express.static('./build/public'));

    app.use(router);

    server = app.listen(TestDataPort, function () {
        logger.info('Server is running on port: ' + TestDataPort);
    });

}

Main();