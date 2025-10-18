import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction } from "discord.js";

export abstract class Modal {
    public abstract customId: string;
    public abstract title: string;

    public getModal(): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(this.customId)
            .setTitle(this.title);
        const components = this.getComponents();
        components.forEach(c => {
            modal.addComponents(c);
        });
        return modal;
    }

    public abstract getComponents(): ActionRowBuilder<ModalActionRowComponentBuilder>[];

    public abstract process(interaction: ModalSubmitInteraction): Promise<void>;

    public async show(interaction: ChatInputCommandInteraction) {
        const modal = this.getModal();
        await interaction.showModal(modal);
    }
}