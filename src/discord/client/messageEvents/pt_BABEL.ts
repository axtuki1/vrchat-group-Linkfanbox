import { MessageEvent, MessageEventHandler, ProcessChannel } from "../messageEvent";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * パトレイバーパロ 例のコマンド起動時のあれ
 */
export class BABELMessageEvent extends MessageEventHandler {

    public priority = 10;

    public processChannel = [ProcessChannel.DM];

    private babel = "```diff\n-BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL BABEL```";

    private count = 10;

    private triggerWord = "E.HOBA";
    
    public async process(event: MessageEvent): Promise<void> {
        if (event.message.content !== this.triggerWord) {
            return;
        }
        let msgBody = "Go to, let us go down, "
        const mes = await event.message.author.send(msgBody);
        await sleep(2000);
        msgBody += "and there confound their language, ";
        await mes.edit(msgBody);
        await sleep(2000);
        msgBody += "\nthat they may not understand";
        await mes.edit(msgBody);
        await sleep(2000);
        msgBody += "one another's speech.";
        await mes.edit(msgBody);
        await sleep(5000);
        await mes.delete();
        await sleep(1000);
        const msgs = [];
        for (let i = 0; i < this.count; i++) {
            msgs.push(await event.message.author.send(this.babel));
            await sleep(500);
        }
        await sleep(2000);
        for(const msg of msgs) {
            await msg.delete();
            await sleep(150);
        }
        await event.message.author.send("？？？「いくら便利なもんでも、素性のしれないソフトウェアを乗っける気になれなくってさ～」\nコンピュータウイルスには気をつけよう！");
        event.isCanneled = true;
    }

}