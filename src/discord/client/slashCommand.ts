import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordBotClient } from ".";

export interface SlashCommandOption {
    name: string;
    description: string;
    type: "string" | "integer" | "boolean" | "user" | "channel" | "role" | "mentionable" | "number";
    required?: boolean;
    choices?: { name: string; value: string | number }[];
}

export abstract class SlashCommand {

    public bot: DiscordBotClient;
    public abstract name: string;
    public abstract description: string;
    public abstract options?: any[];
    public subCommands: SlashCommand[];
    public processStartTimeStamp: Date;
    public processStartPerformance: number;

    constructor(bot: DiscordBotClient) {
        this.bot = bot;
    }

    public abstract execute(interaction: ChatInputCommandInteraction);

    public getSlashCommand(): SlashCommandBuilder {
        const cmd = new SlashCommandBuilder().setName(this.name).setDescription(this.description);
        if (this.subCommands && this.subCommands.length > 0) {
            this.subCommands.forEach(subCmdInstance => {
                cmd.addSubcommand(subCmd => subCmdInstance.getSlashSubCommand(subCmd));
            })
        }
        if (this.options && this.options.length > 0) {
            this.options.forEach(option => {
                switch (option.type) {
                    case "string":
                        const stringOption = cmd.addStringOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            if (option.choices) {
                                option.choices.forEach((choice: { name: string; value: string | number }) => {
                                    opt.addChoices({ name: choice.name, value: String(choice.value) });
                                });
                            }
                            return opt;
                        });
                        break;
                    case "integer":
                        const intOption = cmd.addIntegerOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            if (option.choices) {
                                option.choices.forEach((choice: { name: string; value: string | number }) => {
                                    opt.addChoices({ name: choice.name, value: Number(choice.value) });
                                });
                            }
                            return opt;
                        });
                        break;
                    case "boolean":
                        cmd.addBooleanOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "user":
                        cmd.addUserOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "channel":
                        cmd.addChannelOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "role":
                        cmd.addRoleOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "mentionable":
                        cmd.addMentionableOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "number":
                        cmd.addNumberOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            if (option.choices) {
                                option.choices.forEach((choice: { name: string; value: string | number }) => {
                                    opt.addChoices({ name: choice.name, value: Number(choice.value) });
                                });
                            }
                            return opt;
                        });
                        break;
                    default:
                        throw new Error(`Unknown option type: ${option.type}`);
                }
            });
        }
        return cmd;
    }

    public getSlashSubCommand(subCmd: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        subCmd.setName(this.name).setDescription(this.description);
        return subCmd;
    }


}