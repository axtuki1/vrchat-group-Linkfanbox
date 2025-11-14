import { ButtonInteraction, ButtonStyle } from "discord.js";
import { Button } from "../button";
import { SettingsRootContainer } from "../containers/settingsRoot";

export class ToSettingRootButton extends Button {
    public customId: string = "settings_to_root";
    public label: string = "＜";
    public style: ButtonStyle = ButtonStyle.Secondary;

    public async execute(interaction: ButtonInteraction): Promise<void> {
        
        await interaction.update({
            components: [
                new SettingsRootContainer().render()
            ],
        });
    }
}