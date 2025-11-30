import { ButtonInteraction, MessageFlags } from "discord.js";
import { Button } from "../../button";
import { RegisterVRChatAccountModal } from "../../modals";
import { GetUserInfoService } from "../../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../../db/factories/UserRepositoryFactory";
import { SettingsRootContainer } from "../../containers/settingsRoot";

export class CommandPaletteSettingsButton extends Button {
    public customId: string = "cp_settings_button";
    public label: string = "開く";

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async execute(interaction: ButtonInteraction): Promise<void> {

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