import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export abstract class SlashCommand {

    public abstract name: string;
    public abstract description: string;

    public abstract execute(interaction: ChatInputCommandInteraction);

    public getSlashCommand(){
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
    }

}