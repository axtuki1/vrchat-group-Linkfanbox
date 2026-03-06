import { ContainerBuilder } from "discord.js";
import { Container } from "../container";
import { ToEEWSettingsButton } from "../buttons";

export class SettingsRootContainer extends Container {

    public render(): ContainerBuilder {
        const container = new ContainerBuilder()
            .setAccentColor(0x0099ff)
            .addTextDisplayComponents(textDisplay => (
                textDisplay.setContent("## 設定\nサービスを選択してください。")
            ))
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) => (
                section
                    .addTextDisplayComponents((textDisplay) => (
                        textDisplay.setContent(
                            "### 災害情報室 - [Link](https://vrchat.com/home/group/grp_798dff1c-3212-4886-92bb-4430b7c691b4)\n" +
                            "災害情報を通知するVRChatグループ\n" +
                            "『災害情報室』の各種設定を行います。"
                        )
                    ))
                    .setButtonAccessory((button) => new ToEEWSettingsButton().getButtonComponent(button))
            ));
        
        return container;
    }

}