import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { SlashCommand } from "../slashCommand";
import { Logger } from "../../../util/logger";
import { ProductRepositoryInterface } from "../../../db/interfaces/ProductRepositoryInterface";
import { ProductRepositoryFactory } from "../../../db/factories/ProductRepositoryFactory";
import { TicketService } from "../../../db/services/TicketService";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";

export class Coupon extends SlashCommand {
    public name: string = "coupon";
    public description: string = "クーポンコードからチケットやライセンスを取得します。";
    public options = [
        { name: "code", description: "クーポンコード", type: "string", required: true }
    ];
    public logger: Logger = new Logger("CouponCommand");

    private ticketRepo: TicketService = new TicketService(ProductRepositoryFactory.create());
    private userRepo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async execute(interaction: ChatInputCommandInteraction) {
        const code = interaction.options.getString("code");
        if (!code) {
            await interaction.reply({
                embeds: [
                    this.getResponseTemplate()
                        .setColor(0xff0000)
                        .setTitle("エラー")
                        .setDescription(`クーポンコードを指定してください。`)
                ],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.reply({
            embeds: [this.getPendingEmbed()],
            flags: MessageFlags.Ephemeral || MessageFlags.SuppressNotifications
        });

        const userData = await this.userRepo.getUserInfoByDiscordId(interaction.user.id);
        if (!userData) {
            const embed = this.getResponseTemplate()
                .setTitle("エラー")
                .setDescription(
                    `まだ登録されていません。
                    /register コマンドでVRChatアカウントを登録してください。`
                )
                .setColor(0xFF0000);
            await interaction.editReply({
                embeds: [embed]
            });
            return;
        }

        const product = await this.ticketRepo.getProductById(code);
        
        if (
            !product ||
            (
                product.allowPlanIds &&
                product.allowPlanIds.length > 0 &&
                (
                    !userData.fanboxPlanId ||
                    !product.allowPlanIds.includes(userData.fanboxPlanId)
                )
            )
        ) {
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setColor(0xff0000)
                        .setTitle("エラー")
                        .setDescription(`無効なクーポンコードです。`)
                ]
            });
            return;
        }

        try {

            const currentTicket = await this.ticketRepo.getAssignedTicketUser(product.productId, userData.userId);

            if (currentTicket) {
                const embed = this.getResponseTemplate()
                    .setColor(0x00ffff)
                    .setTitle("割当済みチケット")
                    .addFields(
                        {
                            name: "商品名",
                            value: product.productName,
                            inline: false
                        },{
                            name: "コード",
                            value: currentTicket.content,
                            inline: false
                        }
                    );

                if (currentTicket.url) {
                    embed.addFields({
                        name: "リンク",
                        value: `[Click Here!](${currentTicket.url})`,
                        inline: false
                    });
                }

                if (currentTicket.comment) {
                    embed.addFields({
                        name: "備考",
                        value: currentTicket.comment,
                        inline: false
                    });
                }

                await interaction.editReply({
                    embeds: [embed]
                });
                return;
            }

            const newTicket = await this.ticketRepo.assignTicketToUser(product.productId, userData.userId);

            const embed = this.getResponseTemplate()
                .setColor(0x00ffff)
                .setTitle("発行チケット")
                .setDescription(`チケットを発行しました。`)
                .addFields(
                    {
                        name: "商品名",
                        value: product.productName,
                        inline: false
                    },
                    {
                        name: "コード",
                        value: newTicket.content,
                        inline: false
                    }
                );

            if (newTicket.url) {
                embed.addFields({
                    name: "リンク",
                    value: `[Click Here!](${newTicket.url})`,
                    inline: false
                });
            }

            if(newTicket.comment) {
                embed.addFields({
                    name: "備考",
                    value: newTicket.comment,
                    inline: false
                });
            }

            await interaction.editReply({
                embeds: [embed]
            });
        } catch (error) {
            console.log(error);
            await interaction.editReply({
                embeds: [
                    this.getResponseTemplate()
                        .setColor(0xff0000)
                        .setTitle("エラー")
                        .setDescription(`チケットの割り当てに失敗しました。`)
                ]
            });
        }

    }
}