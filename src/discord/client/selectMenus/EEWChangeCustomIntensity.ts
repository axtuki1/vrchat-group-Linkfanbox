import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import { Button } from "../button";
import { SettingsEEWContainer } from "../containers/settingsEEW";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import { ToEEWSettingsButton } from "../buttons/toEEWButton";
import { SelectMenu, SelectMenuOption } from "../selectMenu";

export class EEWChangeCustomIntensity extends SelectMenu {

    public customId: string = "eew_CustomIntensity_Select";
    public placeholder: string = "通知震度の設定変更";
    public currentSelected: string;

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    constructor(currentSelected: string) {
        super();
        this.currentSelected = currentSelected;
    }

    public options(): SelectMenuOption[] {
        return [
            {
                label: "震度3以上",
                description: "震度3以上の通知を受け取ります。",
                value: "intensity_3",
                default: this.currentSelected === "intensity_3"
            },
            {
                label: "震度4以上",
                description: "震度4以上の通知を受け取ります。",
                value: "intensity_4",
                default: this.currentSelected === "intensity_4"
            },
            {
                label: "震度5弱以上",
                description: "震度5弱以上の通知を受け取ります。",
                value: "intensity_5_lower",
                default: this.currentSelected === "intensity_5_lower"
            },
            {
                label: "震度5強以上",
                description: "震度5強以上の通知を受け取ります。",
                value: "intensity_5_upper",
                default: this.currentSelected === "intensity_5_upper"
            },
            {
                label: "震度6弱以上",
                description: "震度6弱以上の通知を受け取ります。",
                value: "intensity_6_lower",
                default: this.currentSelected === "intensity_6_lower"
            },
            {
                label: "震度6強以上",
                description: "震度6強以上の通知を受け取ります。",
                value: "intensity_6_upper",
                default: this.currentSelected === "intensity_6_upper"
            },
            {
                label: "震度7のみ",
                description: "震度7のみ通知を受け取ります。",
                value: "intensity_7",
                default: this.currentSelected === "intensity_7"
            },
            {
                label: "警報のみ",
                description: "警報が発報された場合のみ通知を受け取ります。",
                value: "warning_only",
                default: this.currentSelected === "warning_only"
            }
        ];
    }

    // EEWの画面を再表示
    public async execute(interaction: StringSelectMenuInteraction): Promise<void> {
        const userSettings = await this.repo.getUserSettingsByDiscordId(interaction.user.id);

        userSettings.eew_CustomIntensitySetting = interaction.values[0];

        await this.repo.updateUserSettings(
            userSettings.userId,
            {
                eew_CustomIntensitySetting: userSettings.eew_CustomIntensitySetting
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

export class EEWCustomIntensityUtil {
    public static getIntensityValueFromLabel(label: string): string {
        switch(label) {
            case "震度3以上":
                return "intensity_3";
            case "震度4以上":
                return "intensity_4";
            case "震度5弱以上":
                return "intensity_5_lower";
            case "震度5強以上":
                return "intensity_5_upper";
            case "震度6弱以上":
                return "intensity_6_lower";
            case "震度6強以上":
                return "intensity_6_upper";
            case "震度7のみ":
                return "intensity_7";
            case "警報のみ":
                return "warning_only";
            default:
                return "intensity_4";
        }
    }

    public static getLabelFromIntensityValue(value: string): string {
        switch(value) {
            case "intensity_3":
                return "震度3以上";
            case "intensity_4":
                return "震度4以上";
            case "intensity_5_lower":
                return "震度5弱以上";
            case "intensity_5_upper":
                return "震度5強以上";
            case "intensity_6_lower":
                return "震度6弱以上";
            case "intensity_6_upper":
                return "震度6強以上";
            case "intensity_7":
                return "震度7";
            case "warning_only":
                return "警報のみ";
            default:
                return "震度4以上";
        }
    }
}