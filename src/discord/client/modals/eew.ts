import { ActionRowBuilder, TextInputBuilder, ModalSubmitInteraction, ModalActionRowComponentBuilder, TextInputStyle } from "discord.js";
import { Modal } from "../modal";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { Logger } from "../../../util/logger";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";

export class EEWModal extends Modal {
    public customId: string = "eewSettings";
    public title: string = "地震情報Betaの設定";
    public getComponents(): ActionRowBuilder<ModalActionRowComponentBuilder>[] {
        return [
            // new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            //     new 
            // )
        ]
    }

    private logger: Logger = new Logger("EEWModal");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async process(interaction: ModalSubmitInteraction): Promise<void> {
        const userSettings = await this.repo.getUserSettingsByDiscordId(interaction.user.id);

    }
}