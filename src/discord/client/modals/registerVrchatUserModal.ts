import { TextInputBuilder, ModalSubmitInteraction, TextInputStyle, TextDisplayBuilder, LabelBuilder, ComponentBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import { Modal } from "../modal";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { Logger } from "../../../util/logger";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";

const VRCHAT_USERID_INPUT_CUSTOMID = "vrchat_userid_input";

export class RegisterVRChatAccountModal extends Modal {

    public customId: string = "register_vrchat_account_modal";
    public title: string = "VRChatアカウントの登録";
    public getComponents(): ComponentBuilder[] {
        return [
            new LabelBuilder()
                .setLabel("VRChat ユーザーID")
                .setDescription('usr_から始まるVRChatのユーザーIDを入力してください。')
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId(VRCHAT_USERID_INPUT_CUSTOMID)
                        .setStyle(TextInputStyle.Short)
                        .setValue("")
                        .setMaxLength(45)
                        .setPlaceholder("例: usr_dehajima-ruuu-idpp-oimo-jiretuwoireru")
                        .setRequired(true)
                    
                ),
            new TextDisplayBuilder().setContent(
                "VRChatのユーザーIDは、VRChatのウェブサイトから自分のプロフィールを開くとURLの末尾に表示されています。"
            )

        ]
    }

    private logger: Logger = new Logger("RegisterVRChatAccountModal");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async process(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("登録中....")
                    .setFooter({
                        text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`
                    })
            ],
            flags: MessageFlags.Ephemeral || MessageFlags.IsComponentsV2
        });

        const userId = interaction.fields.getTextInputValue(VRCHAT_USERID_INPUT_CUSTOMID);

        // 以下、RegisterVRChatUserCommandの処理をほぼコピペ
        // 多分共通化すべき

        if (!userId) {
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("エラー")
                        .setDescription("VRChatのUserIDを指定してください。")
                        .setColor(0xFF0000)
                ]
            });
            return;
        } else if (!userId.match(/^usr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("エラー")
                        .setDescription("VRChatのUserIDの形式が不正です。")
                        .addFields({
                            name: "送信したVRChatアカウントID", value: `${userId}`
                        })
                        .setColor(0xFF0000)
                ]
            });
            return;
        }

        const existsUser = await this.repo.getUserInfoByDiscordId(interaction.user.id);

        const existsVRChatUser = await this.repo.getUserInfoByVrchatId(userId);

        if (!existsUser) {
            // Discordでははじめまして
            // でもVRChatでは登録済みかも？
            if (existsVRChatUser) {
                // DBに存在する同一VRChatアカウントIDに、DiscordIDが紐づいていない場合はDiscordIDを紐づける
                if (!existsVRChatUser.discordUserId) {
                    await this.repo.updateUser(existsVRChatUser.userId, {
                        discordUserId: interaction.user.id
                    });
                    await interaction.editReply({
                        embeds: [
                            this.getResponseTemplate()
                                .setTitle("登録完了")
                                .setDescription("登録が完了しました。")
                                .addFields({
                                    name: "送信したVRChatアカウントID", value: `${userId}`
                                })
                                .setColor(0x00FF00)
                        ]
                    });
                } else {
                    // すでに紐づいているならエラーとする
                    await interaction.editReply({
                        embeds: [
                            this.getResponseTemplate()
                                .setTitle("エラー")
                                .setDescription(
                                    `指定のVRChatアカウントはすでに他のDiscordアカウントに登録されています。
                                    心当のない場合は管理者にお問い合わせください。`
                                )
                                .addFields({
                                    name: "送信したVRChatアカウントID", value: `${userId}`
                                })
                                .setColor(0xFF0000)
                        ]
                    });
                }
            } else {
                // 新規
                await this.repo.registerUser(
                    userId,
                    null,
                    null,
                    interaction.user.id,
                    null,
                    null
                );
                await interaction.editReply({
                    embeds: [
                        this.getResponseTemplate()
                            .setTitle("登録完了")
                            .setDescription("登録が完了しました。")
                            .addFields({
                                name: "送信したVRChatアカウントID", value: `${userId}`
                            })
                            .setColor(0x00FF00)
                    ]
                });
                return;
            }

        } else {
            if (existsVRChatUser && existsVRChatUser.discordUserId !== interaction.user.id) {
                await interaction.editReply({
                    embeds: [
                        this.getResponseTemplate()
                            .setTitle("エラー")
                            .setDescription(
                                `指定のVRChatアカウントは既に他のDiscordアカウントに登録されています。
                                    心当のない場合は管理者にお問い合わせください。`
                            )
                            .addFields({
                                name: "送信したVRChatアカウントID", value: `${userId}`
                            })
                            .setColor(0xFF0000)
                    ]
                });
                return;
            }
            // 更新
            await this.repo.updateUser(existsUser.userId, {
                vrchatUserId: userId
            });
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("更新完了")
                        .setDescription("更新が完了しました。")
                        .addFields({
                            name: "更新前", value: `${existsUser.vrchatUserId || "未登録"}`
                        })
                        .addFields({
                            name: "更新後", value: `${userId}`
                        })
                        .setColor(0x00FF00)
                ]
            });
            return;
        }
    }
}