import { MessageEvent, MessageEventHandler, ProcessChannel } from "../messageEvent";

/**
 * ダイレクトメッセージ時、どのイベントにもヒットしなかった場合のデフォルトイベント
 */
export class DefaultMessageEvent extends MessageEventHandler {

    public priority = -100; // 最低優先度

    public processChannel = [ProcessChannel.DM];

    private presetMessage: string[] = [
        "さすがですね！！",
        "知らなかったです！",
        "すごいですね！",
        "素敵です～！",
        "センスいいですね！",
        "そうなんですね～",
    ];
    
    public async process(event: MessageEvent): Promise<void> {
        const message = this.presetMessage[Math.floor(Math.random() * this.presetMessage.length)];
        await event.message.author.send(message);
        event.isCanneled = true;
    }

}