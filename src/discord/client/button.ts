import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import { Interaction } from "./interaction";

export abstract class Button extends Interaction {
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