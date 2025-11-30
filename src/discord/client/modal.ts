import { ActionRowBuilder, ChatInputCommandInteraction, ComponentBuilder, EmbedBuilder, LabelBuilder, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextDisplayBuilder } from "discord.js";
import { Interaction } from "./interaction";

export abstract class Modal extends Interaction {
    public abstract customId: string;
    public abstract title: string;

    public getModal(): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(this.customId)
            .setTitle(this.title);
        const components = this.getComponents();
        components.forEach(c => {
            if (c instanceof LabelBuilder) {
                modal.addLabelComponents(c);
            } else if (c instanceof TextDisplayBuilder) {
                modal.addTextDisplayComponents(c);
            }
        });
        return modal;
    }

    public abstract getComponents(): ComponentBuilder[];

    public abstract process(interaction: ModalSubmitInteraction): Promise<void>;

    public async show(interaction: ChatInputCommandInteraction) {
        const modal = this.getModal();
        await interaction.showModal(modal);
    }

}