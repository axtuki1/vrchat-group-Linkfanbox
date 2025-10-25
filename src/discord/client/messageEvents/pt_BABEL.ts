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