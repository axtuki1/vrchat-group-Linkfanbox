import { MessageEvent, MessageEventHandler, ProcessChannel } from "../messageEvent";

/**
 * ダイレクトメッセージ時、デフォルトメッセージのさしすせそ構文に気がついた場合のイベント
 */
export class SaSiSuSeSoMessageEvent extends MessageEventHandler {

    public priority = -99;

    public processChannel = [ProcessChannel.DM];

    private presetMessage: string[] = [
        "ア、バレました？\nまぁ定型文なんてそんなもんです",
        "いや～やっぱわかりますか！\nやっぱり定型文ってバレやすいんですね～",
        "うーん、単調なのは否めないですね～\nでも標準の応答ってなに入れればいいんでしょう？",
        "えぇ、定型文なのでそうなってますが...",
        "おぉ～、「さすがですね！」\n...あ、これもさしすせそ...."
    ];

    public async process(event: MessageEvent): Promise<void> {
        // さしすせそ構文チェック
        const messageContent = event.message.content.toLowerCase();

        // さしすせそ構文のパターンを検出
        const sasisusesoPatterns = [
            /さ.*し.*す.*せ.*そ/,  // 「さしすせそ」が順番に含まれている
            /(さしすせそ|サシスセソ)/,  // 直接的に「さしすせそ」と書かれている
            /定型文/,  // 「定型文」というキーワード
            /(営業|接客).*(さ|し|す|せ|そ)/,  // 営業・接客 + さしすせそのいずれか
            /テンプレ/,  // 「テンプレ」というキーワード
            /コピペ/,   // 「コピペ」というキーワード
        ];

        const isSasisusesoDetected = sasisusesoPatterns.some(pattern => pattern.test(messageContent));

        if (!isSasisusesoDetected) return;

        const message = this.presetMessage[Math.floor(Math.random() * this.presetMessage.length)];
        await event.message.author.send(message);
        event.isCanneled = true;
    }

}