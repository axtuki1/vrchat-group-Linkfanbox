import { EmbedBuilder } from "discord.js";
import { DiscordBotClient } from ".";

export class Interaction {

    public bot: DiscordBotClient;
    public processStartTimeStamp: Date;
    public processStartPerformance: number;

    public getPendingEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setDescription("おまちください....");
        embed.setColor(0xFF6347);
        embed.setFooter({ text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` });
        return embed;
    }

    public getResponseTemplate(): EmbedBuilder {
        const elapsed = performance.now() - this.processStartPerformance;
        let timeText: string;

        if (elapsed < 1000) {
            // 1秒未満はミリ秒で表示
            timeText = `${elapsed.toFixed(1)}ms`;
        } else {
            // 1秒以上は秒で表示
            timeText = `${(elapsed / 1000).toFixed(2)}s`;
        }

        return new EmbedBuilder().setFooter({
            text: `受領日時: ${this.processStartTimeStamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (${timeText})`
        });
    }
}