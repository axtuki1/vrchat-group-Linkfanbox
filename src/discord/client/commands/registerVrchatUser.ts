import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";

export class RegisterVRChatUserCommand extends SlashCommand {
    public name: string = "register";
    public description: string = "DiscordアカウントとVRChatアカウントの紐付けを行います。";
    public options = [
        { name: "UserID", description: "ご自身のVRChatアカウントのUserID(usr_で始まる文字列)", type: "string", required: false }
    ];
    public async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.options.getString("test")) {
            await interaction.reply({ content: `Pong! (test: ${interaction.options.getString("test")})`, flags: MessageFlags.Ephemeral });
            return;
        }
        await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral });
    }
}