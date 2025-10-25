import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { Logger } from "../../../util/logger";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import { SettingsRootContainer } from "../containers/settingsRoot";

export class SettingCommand extends SlashCommand {
    public name: string = "settings";
    public description: string = "各サービスの設定を行います。";
    public options = [];   

    public logger: Logger = new Logger("SettingsCommand");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async execute(interaction: ChatInputCommandInteraction) {

        // ユーザー設定
        const userSetting = await this.repo.getUserSettingsByDiscordId(interaction.user.id);
    
        if (userSetting == null) {
            await interaction.reply({
                embeds: [
                    this.getResponseTemplate()
                        .setColor(0xff0000)
                        .setTitle("ユーザー情報が見つかりません")
                        .setDescription("先に `/register` コマンドでVRChatアカウントと紐付けを行ってください。")
                ],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.reply({
            components: [new SettingsRootContainer().render()],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        });
    }
}

