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


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RefreshCommand extends SlashCommand {
    public name: string = "refresh";
    public description: string = "情報の更新をリクエストします。";
    public options = [

    ];
    public logger: Logger = new Logger("RefreshCommand");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());
    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [this.getPendingEmbed()],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const task: GetDiscordRoleToSupportPlanTask = this.bot.getTask(GetDiscordRoleToSupportPlanTask);

        task.enqueue(interaction.user.id);

        await interaction.editReply({
            embeds: [
                this.getResponseTemplate()
                    .setTitle("待機列に並びました")
                    .setDescription(
                        `情報の更新をリクエストしました。順番に処理されますのでしばらくお待ちください。
                        更新された情報は/mydataコマンドで確認できます。`
                    )
                    .setColor(0x00FF00)
            ]
        });
    }

    private getPendingEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setDescription("おまちください....");
        embed.setColor(0xFF6347);
        embed.setFooter({ text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` });
        return embed;
    }

    public getResponseTemplate(): EmbedBuilder {
        return new EmbedBuilder().setFooter({
            text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (${(performance.now() - this.processStartPerformance).toPrecision(3)}ms)`
        });
    }
}