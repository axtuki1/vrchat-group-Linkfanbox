import { ButtonInteraction } from "discord.js";
import { Button } from "../button";
import { SettingsEEWContainer } from "../containers/settingsEEW";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import { ToEEWSettingsButton } from "./toEEWButton";

export class EEWToggleIntensityOver3 extends Button {
    public customId: string = "settings_eew_toggle_intensity_over_3";
    public label: string = "開く";

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    constructor(currentState: boolean) {
        super();
        this.label = currentState ? "通知をOFFにする" : "通知をONにする";
    }

    // EEWの画面を再表示
    public async execute(interaction: ButtonInteraction): Promise<void> {
        const userSettings = await this.repo.getUserSettingsByDiscordId(interaction.user.id);
        userSettings.eew_EnableIntensityOver3 = !userSettings.eew_EnableIntensityOver3;
        await this.repo.updateUserSettings(
            userSettings.userId,
            {
                eew_EnableIntensityOver3: userSettings.eew_EnableIntensityOver3
            }
        );
        const container = new SettingsEEWContainer().render(userSettings);
        await interaction.update({
            components: [
                container
            ],
        });
    }
}