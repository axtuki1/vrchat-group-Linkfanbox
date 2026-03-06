import { ButtonBuilder, ContainerBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, UserSelectMenuComponent } from "discord.js";
import { Container } from "../container";
import { ToEEWSettingsButton, ToSettingRootButton } from "../buttons";
import { EEWToggleIntensityOver3 } from "../buttons/EEWToggleIntensityOver3";
import { EEWChangeCustomIntensity, EEWCustomIntensityUtil } from "../selectMenus/EEWChangeCustomIntensity";

export class SettingsEEWContainer extends Container {

    public render(userSettings): ContainerBuilder {

        const container = new ContainerBuilder()
            .setAccentColor(0x0099ff)
            .addActionRowComponents((actionRow) => (
                actionRow
                    .addComponents(
                        new ToSettingRootButton().getButtonComponent(new ButtonBuilder())
                    )
            ))
            .addTextDisplayComponents(textDisplay => (
                textDisplay.setContent(
                    "## 災害情報室\n" +
                    "★マークのついた設定は支援者限定機能です。\n" +
                    "ロールの付与、解除については定期実行のため、\n" +
                    "2日経過後も反映されていない場合はお問い合わせください。"
                )
            ))
            .addSeparatorComponents((separator) => separator)
        if (this.config.feature.EnableEEWNoticeIntensityCustom) {

            const customSelect = new EEWChangeCustomIntensity(userSettings.eew_CustomIntensitySetting)
                .getButtonComponent(new StringSelectMenuBuilder());

            container.addTextDisplayComponents((textDisplay) => (
                textDisplay.setContent("### ★通知震度の設定")
            ))
                .addTextDisplayComponents((textDisplay) => (
                    textDisplay.setContent(
                        "通知を行う震度を指定できます。\n" +
                        "" +
                        `＞ __現在の設定: **${EEWCustomIntensityUtil.getLabelFromIntensityValue(userSettings.eew_CustomIntensitySetting)}**__`
                    )
                ))
                .addActionRowComponents((actionRow) => (
                    actionRow
                        .addComponents(customSelect)
                )
                );
        } else {
            container.addSectionComponents((section) => (
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
        return container;
    }

}