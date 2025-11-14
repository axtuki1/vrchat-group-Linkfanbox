import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

export abstract class Button {
    public abstract customId: string;
    public abstract label: string;
    public style: ButtonStyle = ButtonStyle.Primary;

    public abstract execute(interaction: ButtonInteraction): Promise<void>;

    public getButtonComponent(button: ButtonBuilder) {
        return button
            .setCustomId(this.customId)
            .setLabel(this.label)
            .setStyle(this.style);
    }
}