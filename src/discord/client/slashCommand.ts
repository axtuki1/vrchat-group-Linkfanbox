import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export abstract class SlashCommand {

    public abstract name: string;
    public abstract description: string;
    public subCommands: SlashCommand[];

    public abstract execute(interaction: ChatInputCommandInteraction);

    public getSlashCommand(): SlashCommandBuilder {
        const cmd = new SlashCommandBuilder().setName(this.name).setDescription(this.description);
        if (this.subCommands && this.subCommands.length > 0) {
            this.subCommands.forEach(subCmdInstance => {
                cmd.addSubcommand(subCmd => subCmdInstance.getSlashSubCommand(subCmd));
            })
        }
        return cmd;
    }

    public getSlashSubCommand(subCmd: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        subCmd.setName(this.name).setDescription(this.description);
        return subCmd;
    }


}