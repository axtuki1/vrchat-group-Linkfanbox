import { Task } from "..";
import { GetUserInfoService } from "../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../db/factories/UserRepositoryFactory";
import { DiscordBotClient } from "../../discord/client";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();
import { Logger } from "../../util/logger";
import { GetDiscordRoleToSupportPlanTask } from "../GetDiscordRoleToSupportPlan";

/**
 * 登録済みのユーザーのDiscordアカウントを定期的に確認キュー(getDiscordRoleToSupportPlanTask)に追加するタスク
 */
export class AllDiscordUserCheck extends Task {

    private logger: Logger = new Logger("AllDiscordUserCheck");
    private coolTime: number = 1440; // 24 hours
    private nextExecuteTime: Date;
    private bot: DiscordBotClient = null;
    private discordIdQueue: Array<string> = [];
    private getDiscordRoleToSupportPlanTask: GetDiscordRoleToSupportPlanTask = null;

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    constructor(bot: DiscordBotClient, getDiscordRoleToSupportPlanTask: GetDiscordRoleToSupportPlanTask,coolTime: number = 1440, errorHandler: Function = null) {
        super(errorHandler);
        this.coolTime = coolTime;
        this.bot = bot;
        this.nextExecuteTime = new Date();
        this.bot.registerTask(this);
        this.getDiscordRoleToSupportPlanTask = getDiscordRoleToSupportPlanTask;
    }

    public async execute(): Promise<void> {
        if (this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        try {

            // サーバーの取得
            const guild = await this.bot.client.guilds.fetch(config.authentication.discord.guildId);

            const allUsers = await this.repo.getAllUsersWithDiscordId();

            for (const userInfo of allUsers) {
                if (!userInfo.discordUserId) {
                    continue;
                }
                try {
                    const member = await guild.members.fetch(userInfo.discordUserId);
                    if (!member) {
                        this.logger.debug(`member not found in guild. userId: ${userInfo.userId}, discordUserId: ${userInfo.discordUserId}`);
                        continue;
                    }
                    this.getDiscordRoleToSupportPlanTask.enqueue(userInfo.discordUserId);
                    this.logger.debug(`enqueued user to getDiscordRoleToSupportPlanTask. userId: ${userInfo.userId}, discordUserId: ${userInfo.discordUserId}`);
                } catch (e) {
                    this.logger.debug(`member not found in guild (error). userId: ${userInfo.userId}, discordUserId: ${userInfo.discordUserId}`);
                    continue;
                }
            }
        } catch (e) {
            throw e;
        }
    }

}