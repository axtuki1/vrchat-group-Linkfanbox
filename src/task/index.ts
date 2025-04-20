export abstract class Task {
    
    private interval: NodeJS.Timeout = null;
    private errorHandler: Function = null;

    constructor(errorHandler: Function = null) {
        this.errorHandler = errorHandler;
    }
    
    public abstract execute(): Promise<void>;

    /**
     * タスクを開始します。
     * @param interval 
     */
    public start(interval: number = 1 * 1000) {
        this.interval = setInterval(async () => {
            try {
                await this.execute();
            } catch (e) {
                if (this.errorHandler) {
                    this.errorHandler(e);
                } else {
                    throw e;
                }
            }
        }, interval);
    }

    /**
     * タスクを停止します。
     */
    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * タスクが実行中かどうかを返します。
     * @returns 
     */
    public isRunning(): boolean {
        return this.interval != null;
    }
}