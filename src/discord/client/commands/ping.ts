import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../slashCommand";

export class Ping extends SlashCommand{
    public name: string = "ping";
    public description: string = "Pong!";
    public execute(interaction: ChatInputCommandInteraction) {
        interaction.reply("Pong!");
    }
}