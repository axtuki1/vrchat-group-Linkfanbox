import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";

export class Ping extends SlashCommand {
    public name: string = "ping";
    public description: string = "Pong!";
    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral });
    }
}