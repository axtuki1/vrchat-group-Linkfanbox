import { Task } from "..";
import { UserRepositoryFactory } from "../../db/factories/UserRepositoryFactory";
import { GetUserInfoService } from "../../db/services/GetUserInfoService";
import { Logger } from "../../util/logger";
import { GroupRoleApplyTask } from "../GroupRoleApplyTask";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class CheckApplyUserTask extends Task {

    private logger: Logger = new Logger("CheckApplyUserTask");
    private groupRoleList = {};
    private groupRoleApplyTask: GroupRoleApplyTask = null;
    private coolTime: number = 1440; // 24 hours
    private nextExecuteTime: Date;
    private repo: GetUserInfoService = null;

    constructor(
        groupRoleApplyTask: GroupRoleApplyTask,
        coolTime: number = 1440,
        errorHandler: Function = null
    ) {
        super(errorHandler);
        this.groupRoleApplyTask = groupRoleApplyTask;
        this.coolTime = coolTime;
        this.nextExecuteTime = new Date();
        this.repo = new GetUserInfoService(UserRepositoryFactory.create());

        for (const groupId of config.settings.vrchat.groups) {
            this.groupRoleList[groupId] = [];
            for (const plan of Object.keys(config.settings.fanbox.plans)) {
                const roleIds = config.settings.fanbox.plans[plan][groupId];
                for (const roleId of roleIds) {
                    if (this.groupRoleList[groupId].indexOf(roleId) !== -1) continue;
                    this.groupRoleList[groupId].push(roleId);
                }
            }
        }
    }

    public async execute(): Promise<void> {
        if (this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        // vrchatへ登録
        try {
            const users = await this.repo.getRegisteredUsers();
            if (users == null || users.length == 0) return;
            if (
                config.settings.fanbox.plans == null ||
                config.settings.vrchat.groups == null
            ) return;
            // this.logger.debug(users);
            for (const user of users) {
                if (
                    user.vrchatUserId == null ||
                    user.fanboxPlanId == null ||
                    user.vrchatUserId == "" ||
                    user.fanboxPlanId == ""
                ) continue;
                this.logger.debug("execute user: " + JSON.stringify(user));
                const userId = user.vrchatUserId;
                const planId = user.fanboxPlanId;
                const groupIds = Object.keys(this.groupRoleList);

                if (config.settings.fanbox.plans[planId] == null) continue;

                for (const groupId of groupIds) {
                    const roleIds = this.groupRoleList[groupId];
                    if (roleIds == null || roleIds.length == 0) continue;
                    const applyList = {};
                    for (const roleId of roleIds) {
                        applyList[roleId] = false;
                        if (
                            config.settings.fanbox.plans[planId][groupId].indexOf(roleId) !== -1 ||
                            config.settings.fanbox.plans[planId][groupId].indexOf("*") !== -1
                        ) {
                            applyList[roleId] = true;
                        }
                    }
                    this.logger.info("Apply Role: " + userId + " groupId: " + groupId + " applyList: " + JSON.stringify(applyList));
                    await this.groupRoleApplyTask.AddQueue(
                        userId,
                        groupId,
                        applyList
                    )
                }
            }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }

}