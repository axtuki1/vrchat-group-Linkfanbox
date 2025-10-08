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

    /**
     * キューを取得します。
     * @return キュー
     */
    public getQueue(): Array<string> {
        return this.discordIdQueue;
    }

    /**
     * キューをクリアします。
     */
    public clearQueue(): void {
        this.discordIdQueue = [];
    }

    /**
     * DiscordのユーザーIDをキューに追加します。
     * @param discordId DiscordのユーザーID
     * @returns 待ち人数(0で即時処理)
     */
    public enqueue(discordId: string): number {
        if (!this.discordIdQueue.includes(discordId)) {
            this.discordIdQueue.push(discordId);
        }
        return this.discordIdQueue.length - 1;
    }

    /**
     * キュー内の位置を取得します。
     * @param discordId DiscordのユーザーID
     * @returns 位置(0で先頭、-1でキューに存在しない)
     */
    public getQueuePosition(discordId: string): number {
        return this.discordIdQueue.indexOf(discordId);
    }

    public async execute(): Promise<void> {
        if (this.discordIdQueue.length === 0 || this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        try {

            // サーバーの取得
            const guild = await this.bot.client.guilds.fetch(config.authentication.discord.guildId);

            // キューからDiscordIDを取り出す
            const discordId = this.discordIdQueue.shift();
            // キューのユーザーを取得

            this.logger.debug(`Processing Discord user ID: ${discordId}`);

            const discordUser = await guild.members.fetch(discordId);

            if (!discordUser) {
                this.logger.warn(`Cannot get info for Discord user (ID: ${discordId})`);
                return;
            }

            // DiscordIDに紐づくDBに登録されているユーザー情報を取得
            const userInfo = await this.repo.getUserInfoByDiscordId(discordId);
            if (!userInfo) {
                this.logger.warn(`Cannot find user info for Discord user (ID: ${discordId})`);
                return;
            }

            // Discordユーザーに付与されているロールを取得
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
                        fanboxPlanId: planId,
                        planUpdateAt: new Date()
                    });
                    this.logger.debug(`found role for plan. userId: ${userInfo.userId}, planId: ${planId}(${config.settings.planDisplayName[planId] || "unknown"})`);
                    return;
                }
            }
            // 付与されているロールのうち、サポートプランに対応するものがない場合
            // planIdがある かつ planUpdateAtが1か月以上前なら、プラン未加入としてDBを更新する(planUpdateAtは更新しない)
            if (userInfo.fanboxPlanId && userInfo.planUpdateAt) {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                if (userInfo.planUpdateAt < oneMonthAgo) {
                    await this.repo.updateUser(userInfo.userId, {
                        fanboxPlanId: null
                    });
                    this.logger.debug(`not found role for plan, and last update was over a month ago. userId: ${userInfo.userId}`);
                    return;
                } else {
                    this.logger.debug(`not found role for plan, but last update was within a month. skip updating. userId: ${userInfo.userId}`);
                    return;
                }
            }
        } catch (e) {
            throw e;
        }
    }

}