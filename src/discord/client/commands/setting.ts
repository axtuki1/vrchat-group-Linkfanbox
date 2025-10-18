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
        await interaction.reply({
            components: [new SettingsRootContainer().render()],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        });
    }
}

