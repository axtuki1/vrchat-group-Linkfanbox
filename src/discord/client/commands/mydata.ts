import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import * as fs from "fs";
import { Logger } from "../../../util/logger";
import { GetDiscordRoleToSupportPlanTask } from "../../../task/GetDiscordRoleToSupportPlan";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();
interface MyData {
    VRChat: {
        id?: string;
        displayName?: string;
    },
    pixiv: {
        id?: string;
        plan?: string;
        planName?: string;
    },
    updateAt: Date;
    planUpdateAt: Date;
    active: boolean;
    queuePosition?: number;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MyDataCommand extends SlashCommand {
    public name: string = "mydata";
    public description: string = "Discordアカウントに紐づいている情報を確認します。";
    public options = [

    ];
    public logger: Logger = new Logger("MyDataCommand");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());
    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [this.getPendingEmbed()],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const myData: MyData = { active: false, VRChat: {}, pixiv: {}, updateAt: null, planUpdateAt: null };

        const task = this.bot.getTask(GetDiscordRoleToSupportPlanTask);

        const userData = await this.repo.getUserInfoByDiscordId(interaction.user.id);
        if (userData) {
            myData.active = true;
            if (userData.vrchatUserId) {
                myData.VRChat.id = userData.vrchatUserId;
                myData.VRChat.displayName = userData.vrchatDisplayName;
            }
            if (userData.pixivUserId) {
                myData.pixiv.id = userData.pixivUserId;
            }
            if (userData.fanboxPlanId) {
                myData.pixiv.plan = userData.fanboxPlanId;
                myData.pixiv.planName = config.settings.planDisplayName[userData.fanboxPlanId] || null;
            }
            myData.updateAt = userData.updatedAt;
            myData.planUpdateAt = userData.planUpdateAt;
            myData.queuePosition = task.getQueuePosition(interaction.user.id);
        }

        await wait(1000); // Simulate data fetching delay

        await interaction.editReply({
            embeds: [this.getDataEmbeds(myData)]
        });
    }

    private getDataEmbeds(data: MyData): EmbedBuilder {
        const embed = this.getResponseTemplate();
        
        embed.setTitle("アカウント情報");
        embed.setColor(0x00FF00);

        if (data.VRChat && data.VRChat.id) {
            if (data.VRChat.displayName) {
                embed.addFields({
                    name: "VRChat",
                    value: `${data.VRChat.displayName}
                    (${data.VRChat.id})`,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: "VRChat",
                    value: `※表示名取得待ち※
                    (${data.VRChat.id})`,
                    inline: false
                });
            }
        } else {
            embed.addFields({
                name: "VRChat",
                value: "未登録",
                inline: false
            });
        }

        if (data.pixiv.id) {
            embed.addFields({
                name: "pixiv(旧認証)",
                value: `${data.pixiv.id}`,
                inline: false
            });
        }

        if (data.pixiv.plan) {
            embed.addFields({
                name: "FANBOX 有効プラン",
                value: `${data.pixiv.planName}`,
                inline: false
            });
        } else {
            embed.addFields({
                name: "FANBOX 有効プラン",
                value: "未加入",
                inline: false
            });
        }
        
        if (data.updateAt) {
            embed.addFields({
                name: "情報更新日時",
                value: `${data.updateAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
                inline: true
            });
        }

        if(data.queuePosition && data.queuePosition >= 0) {
            embed.addFields({
                name: "更新待ち人数",
                value: data.queuePosition > 0 ? `${data.queuePosition}人` : "開始待機中",
                inline: true
            });
        }

        return embed;
    }
}