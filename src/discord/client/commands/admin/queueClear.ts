import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { UserRepositoryFactory } from "../../../../db/factories/UserRepositoryFactory";
import { GetUserInfoService } from "../../../../db/services/GetUserInfoService";
import { GetDiscordRoleToSupportPlanTask } from "../../../../task/GetDiscordRoleToSupportPlan";
import { Logger } from "../../../../util/logger";
import { SlashCommand } from "../../slashCommand";

export class QueueClearCommand extends SlashCommand {
    public name: string = "queueclear";
    public description: string = "キューをクリアします。";
    public options = [
    ];
    public logger: Logger = new Logger("QueueViewCommand");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());
    public async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.memberPermissions.has("Administrator")) {
            await interaction.reply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("エラー")
                        .setDescription("このコマンドを実行する権限がありません。")
                        .setColor(0xFF0000)
                ],
                flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
            });
            return;
        }

        await interaction.reply({
            embeds: [this.getPendingEmbed()],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const task: GetDiscordRoleToSupportPlanTask = this.bot.getTask(GetDiscordRoleToSupportPlanTask);

        const queue = task.getQueue();

        const embed = this.getResponseTemplate()
            .setTitle("現在のキューの状況")
            .setColor(0x00FF00);

        if (queue.length === 0) {
            embed.setDescription("現在、キューは空です。");
        } else {
            task.clearQueue();
            embed.setDescription(`キューをクリアしました。`);
        }

        await interaction.editReply({
            embeds: [embed]
        });
    }

}