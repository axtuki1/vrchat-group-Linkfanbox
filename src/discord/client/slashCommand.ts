import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordBotClient } from ".";
import { Logger } from "../../util/logger";
import { Modal } from "./modal";

export interface SlashCommandOption {
    name: string;
    description: string;
    type: "string" | "integer" | "boolean" | "user" | "channel" | "role" | "mentionable" | "number";
    required?: boolean;
    choices?: { name: string; value: string | number }[];
}

export abstract class SlashCommand {

    public abstract name: string;
    public abstract description: string;
    public abstract options?: any[];
    public bot: DiscordBotClient;
    public subCommands: (new (...args: any[]) => SlashCommand)[];
    private subCommandInstances: SlashCommand[];
    public processStartTimeStamp: Date;
    public processStartPerformance: number;
    public abstract logger: Logger;
    public modals: (new (...args: any[]) => Modal)[];

    constructor(bot: DiscordBotClient) {
        this.bot = bot;
    }

    public abstract execute(interaction: ChatInputCommandInteraction);

    public isSubCommand(interaction: ChatInputCommandInteraction): boolean {
        return this.subCommands && this.subCommands.length > 0 && interaction.options.getSubcommand() !== null;
    }

    public async executeSubCommand(interaction: ChatInputCommandInteraction) {
        if (!this.subCommandInstances || this.subCommandInstances.length === 0) {
            throw new Error("No subcommands available.");
        }
        const subCommand = this.subCommandInstances.find(cmd => cmd.name === interaction.options.getSubcommand());
        if (!subCommand) {
            throw new Error(`Subcommand ${interaction.options.getSubcommand()} not found.`);
        }
        subCommand.bot = this.bot;
        subCommand.processStartTimeStamp = new Date();
        subCommand.processStartPerformance = performance.now();
        return subCommand.execute(interaction);
    }

    public getSlashCommand(): SlashCommandBuilder {
        const cmd = new SlashCommandBuilder().setName(this.name).setDescription(this.description);
        if (this.subCommands && this.subCommands.length > 0) {
            this.subCommands.forEach(subCmdClass => {
                const subCmdInstance = new subCmdClass(this.bot);
                cmd.addSubcommand(subCmd => subCmdInstance.getSlashSubCommand(subCmd));
                this.subCommandInstances = this.subCommandInstances ? [...this.subCommandInstances, subCmdInstance] : [subCmdInstance];
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
        if (this.options && this.options.length > 0) {
            this.options.forEach(option => {
                switch (option.type) {
                    case "string":
                        const stringOption = subCmd.addStringOption(opt => {
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
                        const intOption = subCmd.addIntegerOption(opt => {
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
                        subCmd.addBooleanOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "user":
                        subCmd.addUserOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "channel":
                        subCmd.addChannelOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "role":
                        subCmd.addRoleOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "mentionable":
                        subCmd.addMentionableOption(opt => {
                            opt.setName(option.name)
                                .setDescription(option.description);
                            if (option.required) opt.setRequired(option.required);
                            return opt;
                        });
                        break;
                    case "number":
                        subCmd.addNumberOption(opt => {
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
        return subCmd;
    }

    public getSubCommands(): SlashCommand[] {
        return this.subCommandInstances || [];
    }

    public getPendingEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setDescription("おまちください....");
        embed.setColor(0xFF6347);
        embed.setFooter({ text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` });
        return embed;
    }

    public getResponseTemplate(): EmbedBuilder {
        const elapsed = performance.now() - this.processStartPerformance;
        let timeText: string;

        if (elapsed < 1000) {
            // 1秒未満はミリ秒で表示
            timeText = `${elapsed.toFixed(1)}ms`;
        } else {
            // 1秒以上は秒で表示
            timeText = `${(elapsed / 1000).toFixed(2)}s`;
        }

        return new EmbedBuilder().setFooter({
            text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (${timeText})`
        });
    }

}