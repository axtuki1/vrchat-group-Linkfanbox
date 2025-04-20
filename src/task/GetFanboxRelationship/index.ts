import { Task } from "..";
import { FANBOX } from "../../fanbox";
import { Logger } from "../../util/logger";

export class GetFanboxRelationshipTask extends Task {

    private fanbox: FANBOX
    private logger: Logger = new Logger("GetFanboxRelationshipTask");
    private coolTime: number = 1440; // 24 hours
    private nextExecuteTime: Date;
    private supporterHandler: Function = null;

    constructor(fanbox: FANBOX, coolTime: number = 1440, supporterHandler: Function, errorHandler: Function = null) {
        super(errorHandler);
        this.fanbox = fanbox;
        this.coolTime = coolTime;
        this.nextExecuteTime = new Date();
        this.supporterHandler = supporterHandler;
    }

    public async execute(): Promise<void> {
        if (this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        try {
            const fanboxRes = await this.fanbox.getSupporterList();
            this.supporterHandler(fanboxRes);
        } catch (e) {
            throw e;
        }
    }

}