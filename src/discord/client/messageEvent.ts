import { Message, OmitPartialGroupDMChannel } from "discord.js";


export class MessageEvent {
    
    /**
     * Discordから送信されたメッセージ
     */
    public message: OmitPartialGroupDMChannel<Message<boolean>>;
    
    /**
     * このイベントがキャンセルされたかどうか
     * キャンセルされた場合、以降のイベントハンドラを実行せず終了する。
     */
    public isCanneled: boolean = false;

    constructor(message: OmitPartialGroupDMChannel<Message<boolean>>) {
        this.message = message;
    }

}

export const ProcessChannel = {
    GUILD: "GUILD",
    DM: "DM"
} as const;
type ProcessChannel = (typeof ProcessChannel)[keyof typeof ProcessChannel];

export abstract class MessageEventHandler {
    
    /**
     * 優先度（数値が高いほど優先される）
     */
    public priority: number = 0;

    public processChannel: ProcessChannel[] = [ProcessChannel.GUILD, ProcessChannel.DM];

    public abstract process(event: MessageEvent): Promise<void>;
    
}