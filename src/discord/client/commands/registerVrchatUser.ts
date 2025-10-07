import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RegisterVRChatUserCommand extends SlashCommand {
    public name: string = "register";
    public description: string = "DiscordアカウントとVRChatアカウントの紐付けを行います。";
    public options = [
        { name: "user_id", description: "ご自身のVRChatアカウントのUserID(usr_で始まる文字列)", type: "string", required: true }
    ];

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("登録中....")
                    .setFooter({ text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` })
            ],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const userId = interaction.options.getString("user_id");
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
        } else if (!userId.match(/^usr_[0-9a-zA-Z]+$/)) {
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("エラー")
                        .setDescription("VRChatのUserIDの形式が不正です。")
                        .setColor(0xFF0000)
                ]
            });
            return;
        }

        console.log(interaction)

        const existsUser = await this.repo.getUserInfoByDiscordId(interaction.user.id);

        if (!existsUser) {
            // Discordでははじめまして
            // でもVRChatでは登録済みかも？
            const existsVRChatUser = await this.repo.getUserInfoByVrchatId(userId);
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
                                    `そのVRChatアカウントはすでに他のDiscordアカウントに登録されています。
                                    心当のない場合は管理者にお問い合わせください。`
                                )
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
                            .setColor(0x00FF00)
                    ]
                });
                return;
            }

        } else {
            // 更新
            await this.repo.updateUser(existsUser.userId, {
                vrchatUserId: userId
            });
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setTitle("更新完了")
                        .setDescription("更新が完了しました。")
                        .setColor(0x00FF00)
                ]
            });
            return;
        }


    }

    public getResponseTemplate(): EmbedBuilder {
        return new EmbedBuilder().setFooter({
            text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (${(performance.now() - this.processStartPerformance).toPrecision(3)}ms)`
        });
    }
}