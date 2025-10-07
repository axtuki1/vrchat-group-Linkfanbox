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

export class GetDiscordRoleToSupportPlanTask extends Task {

    private logger: Logger = new Logger("GetDiscordRoleToSupportPlanTask");
    private coolTime: number = 1440; // 24 hours
    private nextExecuteTime: Date;
    private bot: DiscordBotClient = null;
    private discordIdQueue: Array<string> = [];

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    constructor(bot: DiscordBotClient, coolTime: number = 0.1, errorHandler: Function = null) {
        super(errorHandler);
        this.coolTime = coolTime;
        this.bot = bot;
        this.nextExecuteTime = new Date();
        this.bot.registerTask(this);
    }

    public enqueue(discordId: string) {
        if (!this.discordIdQueue.includes(discordId)) {
            this.discordIdQueue.push(discordId);
        }
    }

    public async execute(): Promise<void> {
        if (this.discordIdQueue.length === 0 || this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        try {

            const guild = await this.bot.client.guilds.fetch(config.authentication.discord.guildId);

            const discordId = this.discordIdQueue.shift();

            this.logger.debug(`Processing Discord user ID: ${discordId}`);

            const discordUser = await guild.members.fetch(discordId);
            if (!discordUser) {
                this.logger.warn(`Cannot get info for Discord user (ID: ${discordId})`);
                return;
            }
            const userInfo = await this.repo.getUserInfoByDiscordId(discordId);
            if (!userInfo) {
                this.logger.warn(`Cannot find user info for Discord user (ID: ${discordId})`);
                return;
            }
            const roles = discordUser.roles.cache;
            if (!roles) {
                this.logger.warn(`Cannot get roles for Discord user (ID: ${discordId})`);
                return;
            }
            // 付与されているロールのうち、サポートプランに対応するものがある場合
            // 対応するプランに加入しているとしてDBを更新する
            const planRoleMap = config.settings.discord.roleIdForPlan;
            for (const planId in planRoleMap) {
                const roleId = planRoleMap[planId];
                if (roles.has(roleId)) {
                    // 対応するプランに加入しているとしてDBを更新する
                    await this.repo.updateUser(userInfo.userId, {
                        fanboxPlanId: planId
                    });
                    this.logger.debug(`found role for plan. userId: ${userInfo.userId}, planId: ${planId}(${config.settings.planDisplayName[planId] || "unknown"})`);
                    return;
                }
            }
            // 付与されているロールのうち、サポートプランに対応するものがない場合
            // サポートプランに未加入としてDBを更新する
            await this.repo.updateUser(userInfo.userId, {
                fanboxPlanId: null
            });
            this.logger.debug(`found no role for plan. userId: ${userInfo.userId}`);
            return;
            

        } catch (e) {
            throw e;
        }
    }

}