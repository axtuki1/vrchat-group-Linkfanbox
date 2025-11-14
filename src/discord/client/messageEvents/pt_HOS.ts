import { EmbedBuilder } from "discord.js";
import { MessageEvent, MessageEventHandler, ProcessChannel } from "../messageEvent";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * パトレイバーパロ 例のコマンド起動時のあれ
 */
export class HOSMessageEvent extends MessageEventHandler {

    public priority = 10;

    public processChannel = [ProcessChannel.DM];

    private triggerWord = "!hos_master";

    public async process(event: MessageEvent): Promise<void> {
        if (!event.message.content.toLowerCase().includes(this.triggerWord)) {
            return;
        }
        await event.message.channel.sendTyping();
        await sleep(500);
        await event.message.author.send("attach cd 01 / ");
        await event.message.channel.sendTyping();
        await sleep(1500);
        await event.message.author.send("enter author password");
        await event.message.channel.sendTyping();
        await sleep(1000);
        await event.message.author.send("pass: ");

        event.isCanneled = true;
    }

}