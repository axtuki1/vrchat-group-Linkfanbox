import * as fs from "fs";
import { parse } from "jsonc-parser";
import { Task } from "..";
import { UserRepositoryFactory } from "../../db/factories/UserRepositoryFactory";
import { GetUserInfoService } from "../../db/services/GetUserInfoService";
import { Logger } from "../../util/logger";
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class UpdateSupporterListTask extends Task {

    private logger: Logger = new Logger("UpdateSupporterListTask");
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());
    private coolTime: number = 1440; // 24 hours
    private nextExecuteTime: Date = new Date();

    constructor(errorHandler: Function = null) {
        super(errorHandler);
    }

    public async execute(): Promise<void> {
        if (this.nextExecuteTime > new Date()) {
            return;
        }
        this.nextExecuteTime = new Date(new Date().getTime() + this.coolTime * 60 * 1000);
        this.logger.info("Updating supporter list...");
        try {
            const users = await this.repo.getRegisteredUsers();
            if (!users || users.length === 0) return;

            const output = {
                lastUpdatedAt: new Date().toISOString(),
                supporterList: {} as Record<string, string[]>,
                planDisplayName: {} as Record<string, string>
            };

            const supporterList: Record<string, string[]> = {};

            const planNameList: Map<string, string> = config.settings.planName;
            const planDisplayNameList: Record<string, string> = config.settings.planDisplayName;

            if (!planNameList) {
                throw new Error("Plan names are not configured in config.json");
            }

            for (const planId in planNameList) {
                if (!planNameList[planId]) {
                    this.logger.warn(`Plan ID ${planId} has no name configured.`);
                }
                const planName = planNameList[planId];
                supporterList[planName] = [];
                output.planDisplayName[planName] = planDisplayNameList[planId] || planName;
            }


            for (const user of users) {
                if (!user.vrchatDisplayName) continue;

                const planName = planNameList[user.fanboxPlanId];

                if (!supporterList[planName]) {
                    supporterList[planName] = [];
                }
                supporterList[planName].push(user.vrchatDisplayName);

            }

            // 各プランの支援者リストをソート
            for (const plan in supporterList) {
                supporterList[plan].sort();
            }

            // プラン順のソート
            const sortedSupporterList: Record<string, string[]> = {};
            Object.keys(supporterList)
                .sort()
                .forEach(key => {
                    sortedSupporterList[key] = supporterList[key];
                });
            output.supporterList = sortedSupporterList;

            // プラン表示名のソート
            const sortedPlanDisplayName: Record<string, string> = {};
            Object.keys(output.planDisplayName)
                .sort()
                .forEach(key => {
                    sortedPlanDisplayName[key] = output.planDisplayName[key];
                });
            output.planDisplayName = sortedPlanDisplayName;

            // GitHub Gistに更新

            const gistId = config.settings.gist.gistId;
            const fileName = config.settings.gist.fileName;
            if (!gistId) {
                throw new Error("Gist URL is not configured in config.json");
            }

            this.logger.info("Updating GitHub Gist with supporter list...");
            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `token ${config.authentication.github.token}`
                },
                body: JSON.stringify({
                    files: {
                        [fileName]: {
                            content: JSON.stringify(output, null, 2)
                        }
                    }
                })
            });

            if (!res.ok) {
                this.logger.error(`Failed to update Gist: ${res.status}`);
                this.logger.error(`Header: ${JSON.stringify(res.headers)}`);
                this.logger.error(`Body: ${await res.text()}`);
                throw new Error(`Failed to update Gist: ${res.status} ${res.statusText} - ${await res.text()}`);
            }

            this.logger.debug("Gist updated successfully: " + await res.json());


        } catch (e) {
            throw e;
        }
        this.logger.info("Supporter list updated successfully.");
    }

}