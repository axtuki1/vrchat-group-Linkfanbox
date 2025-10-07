import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import * as fs from "fs";
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
    active: boolean;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MyDataCommand extends SlashCommand {
    public name: string = "mydata";
    public description: string = "Discordアカウントに紐づいている情報を確認します。";
    public options = [

    ];
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());
    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [this.getPendingEmbed()],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const myData: MyData = { active: false, VRChat: {}, pixiv: {} };

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
        }

        await wait(1000); // Simulate data fetching delay

        await interaction.editReply({
            embeds: [this.getDataEmbeds(myData)]
        });
    }

    private getPendingEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setDescription("おまちください....");
        embed.setColor(0xFF6347);
        embed.setFooter({ text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` });
        return embed;
    }

    private getDataEmbeds(data: MyData): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setTitle("アカウント情報");
        embed.setColor(0x00FF00);

        if (data.VRChat && data.VRChat.id) {
            if (data.VRChat.displayName) {
                embed.addFields({
                    name: "VRChat",
                    value: `${data.VRChat.displayName}\n(${data.VRChat.id})`,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: "VRChat",
                    value: `※表示名取得待ち※ (${data.VRChat.id})`,
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
                name: "FANBOX加入プラン",
                value: `${data.pixiv.planName}`,
                inline: false
            });
        } else {
            embed.addFields({
                name: "FANBOX加入プラン",
                value: "未加入",
                inline: false
            });
        }

        embed.addFields({
            name: "状態",
            value: data.active ? "有効" : "無効",
            inline: false
        });

        return embed;
    }
}