import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { Logger } from "../../../../util/logger";
import { SlashCommand } from "../../slashCommand";
import { CommandPaletteContainer } from "../../containers/commandPalette";

export class SendContainerCommand extends SlashCommand {
    public name: string = "send_container";
    public description: string = "test";
    public options = [
    ];
    public logger: Logger = new Logger("SendContainerCommand");
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
        interaction.channel.send({
            components: [
                new CommandPaletteContainer().render()
            ],
            flags: MessageFlags.IsComponentsV2
        });
    }

}