import { ButtonInteraction } from "discord.js";
import { Button } from "../button";
import { SettingsEEWContainer } from "../containers/settingsEEW";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";

export class ToEEWSettingsButton extends Button {
    public customId: string = "settings_to_eew";
    public label: string = "開く";

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const userSettings = await this.repo.getUserSettingsByDiscordId(interaction.user.id);
        const container = new SettingsEEWContainer().render(userSettings);
        await interaction.update({
            components: [
                container
            ],
        });
    }
}