import { ContainerBuilder } from "discord.js";
import { Container } from "../container";
import { ToEEWSettingsButton } from "../buttons";
import { CommandPaletteRegisterButton } from "../buttons/commandPalette/registerButton";
import { CommandPaletteMyDataButton } from "../buttons/commandPalette/myDataButton";
import { CommandPaletteSettingsButton } from "../buttons/commandPalette/settingsButton";

const package_json = require('../../../../package.json');

export class CommandPaletteContainer extends Container {

    public render(): ContainerBuilder {
        const container = new ContainerBuilder()
            .setAccentColor(0x0099ff)
            .addTextDisplayComponents(textDisplay => (
                textDisplay.setContent("## コマンドパレット")
            ))
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) => (
                section
                    .addTextDisplayComponents((textDisplay) => (
                        textDisplay.setContent(
                            "### VRChatアカウント登録\n" +
                            "DiscordアカウントとVRChatアカウントを連携します。"
                        )
                    ))
                    .setButtonAccessory((button) => new CommandPaletteRegisterButton().getButtonComponent(button))
            ))
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) => (
                section
                    .addTextDisplayComponents((textDisplay) => (
                        textDisplay.setContent(
                            "### 現在の登録状況を確認\n" +
                            "お使いのDiscordアカウントに紐づく情報を確認します。"
                        )
                    ))
                    .setButtonAccessory((button) => new CommandPaletteMyDataButton().getButtonComponent(button))
            ))
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) => (
                section
                    .addTextDisplayComponents((textDisplay) => (
                        textDisplay.setContent(
                            "### 設定\n" +
                            "各サービスの設定の確認・変更を行います。"
                        )
                    ))
                    .setButtonAccessory((button) => new CommandPaletteSettingsButton().getButtonComponent(button))
            ))
            .addTextDisplayComponents((textDisplay) => (
                textDisplay.setContent(
                    "-# Palette version: " + package_json.version
                )
            ))

        return container;
    }

}