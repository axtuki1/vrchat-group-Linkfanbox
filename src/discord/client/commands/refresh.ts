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

        const enqueueResult = task.enqueue(interaction.user.id);

        if (enqueueResult > 0) {
            await interaction.editReply({
                embeds: [this.getResponseTemplate()
                    .setDescription(
                        `情報の更新をリクエストしました。順番に処理されますのでしばらくお待ちください。
                        更新された情報は/mydataコマンドで確認できます。`
                    )
                    .addFields({ name: "現在の待ち人数", value: `${enqueueResult}人`, inline: true })
                    .setColor(0x00FF00)
                ]
            });
            this.logger.debug(`User ${interaction.user.id} is number ${enqueueResult} in the queue.`);
            return;
        } else {
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("待機列に並びました")
                        .setDescription(
                            `情報の更新をリクエストしました。順番に処理されますのでしばらくお待ちください。
                        更新された情報は/mydataコマンドで確認できます。`
                        )
                        .addFields({ name: "現在の待ち人数", value: `待ち人数なし`, inline: true })
                        .setColor(0x00FF00)
                ]
            });
            this.logger.debug(`User ${interaction.user.id} is being processed immediately.`);
        }
    }

}