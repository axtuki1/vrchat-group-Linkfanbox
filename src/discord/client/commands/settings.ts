import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { Logger } from "../../../util/logger";

export class SettingCommand extends SlashCommand {
    public name: string = "settings";
    public description: string = "各サービスの設定を行います。";
    public options = [
        {
            type: "choice",
            name: "eew",
            
        }
    ];
    public logger: Logger = new Logger("PingCommand");
    public async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.options.getString("test")) {
            await interaction.reply({ content: `Pong! (test: ${interaction.options.getString("test")})`, flags: MessageFlags.Ephemeral });
            return;
        }
        await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral });
    }
}