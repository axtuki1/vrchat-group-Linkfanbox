import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { Logger } from "../../../util/logger";

export class Ping extends SlashCommand {
    public name: string = "ping";
    public description: string = "Pong!";
    public options = [
        { name: "test", description: "test option", type: "string", required: false }
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