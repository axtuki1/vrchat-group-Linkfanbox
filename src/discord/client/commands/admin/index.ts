import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { SlashCommand } from "../../slashCommand";
import { Logger } from "../../../../util/logger";

export class AdminCommand extends SlashCommand {
    public name: string = "admin";
    public description: string = "管理者用コマンドです。";
    public options = [
    ];
    public subCommands: SlashCommand[] = [
        
    ];
    public logger: Logger = new Logger("AdminCommand");
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

        const embed = this.getResponseTemplate()
                    .setTitle("管理者コマンド")
                    .setDescription("サブコマンドを指定してください。")
                    .setColor(0x00FF00);
        
        this.subCommands.forEach(subCmd => {
            embed.addFields({ name: `/${this.name} ${subCmd.name}`, value: subCmd.description, inline: false });
        });

        await interaction.reply({
            embeds: [
                embed
            ],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });
    }
}