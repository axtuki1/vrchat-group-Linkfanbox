import { ButtonInteraction } from "discord.js";
import { Button } from "../../button";
import { RegisterVRChatAccountModal } from "../../modals";

export class CommandPaletteRegisterButton extends Button {
    public customId: string = "cp_register_button";
    public label: string = "登録";

    public async execute(interaction: ButtonInteraction): Promise<void> {
        interaction.showModal(new RegisterVRChatAccountModal().getModal());
    }
}