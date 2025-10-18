import { ButtonBuilder, ContainerBuilder } from "discord.js";
import { Container } from "../container";
import { ToEEWSettingsButton, ToSettingRootButton } from "../buttons";
import { EEWToggleIntensityOver3 } from "../buttons/EEWToggleIntensityOver3";

export class SettingsEEWContainer extends Container {

    public render(userSettings): ContainerBuilder {
        return new ContainerBuilder()
            .setAccentColor(0x0099ff)
            .addActionRowComponents((actionRow) => (
                actionRow
                    .addComponents(
                        new ToSettingRootButton().getButtonComponent(new ButtonBuilder())
                    )
            ))
            .addTextDisplayComponents(textDisplay => (
                textDisplay.setContent(
                    "## 地震情報Beta\n" + 
                    "★マークのついた設定は支援者限定機能です。"
                )
            ))
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) => (
                section
                    .addTextDisplayComponents((textDisplay) => (
                        textDisplay.setContent("### ★震度3以上の通知")
                    ))
                    .addTextDisplayComponents((textDisplay) => (
                        textDisplay.setContent(
                            "通知震度を震度3から通知するように設定します。\n" +
                            `＞ __現在の設定: **${userSettings.eew_EnableIntensityOver3 ? "ON" : "OFF"}**__`
                        )
                    ))
                    .setButtonAccessory((button) => new EEWToggleIntensityOver3(userSettings.eew_EnableIntensityOver3).getButtonComponent(button))
            ));
    }

}