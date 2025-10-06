import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";

interface MyData {
    VRChat:{
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
    public async execute(interaction: ChatInputCommandInteraction) {
        const waitMsg = await interaction.reply({ 
            embeds: [this.getPendingEmbed()],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const myData: MyData = {active: false, VRChat: {}, pixiv: {}};

        await wait(1000); // Simulate data fetching delay

        await interaction.deleteReply(waitMsg.id);
        await interaction.editReply({ 
            embeds: [this.getDataEmbeds(myData)]
        });
    }

    private getPendingEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setTitle("Loading...");
        embed.setDescription("おまちください....");
        embed.setColor(0xFF6347);
        embed.setFooter({ text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` });
        return embed;
    }

    private getDataEmbeds(data: MyData): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setTitle("アカウント情報");
        embed.setColor(0x00FF00);

        if(data.VRChat) {
            embed.addFields({
                name: "VRChat",
                value: `${data.VRChat.displayName}\n(${data.VRChat.id})`,
                inline: false
            });
        }

        if(data.pixiv.id) {
            embed.addFields({
                name: "pixiv(旧認証)",
                value: `${data.pixiv.id}`,
                inline: false
            });
        }

        if(data.pixiv.plan) {
            embed.addFields({
                name: "FANBOX加入プラン",
                value: `${data.pixiv.planName}`,
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