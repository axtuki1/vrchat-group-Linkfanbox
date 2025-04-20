import * as fs from "fs";
import * as path from "path";
import { Logger } from "../util/logger";

export class FANBOX {

    /**
     * FANBOX APIを利用するためのクラス
     * ...多分きつい
     */

    private logger: Logger = new Logger("FANBOXAPI");
    private cookies: any = null;
    private cookie: string = null;
    private userAgent: string = null;

    private header: HeadersInit = null;

    constructor(cookies: any, userAgent: string) {
        this.cookies = cookies;
        this.userAgent = userAgent;
        this.cookie = Object.keys(cookies).map((key) => {
            return `${key}=${cookies[key]}`;
        }).join("; ");
        this.header = {
            "Content-Type": "application/json",
            Cookie: this.cookie,
            "User-Agent": this.userAgent,
            accept: "application/json, text/plain, */*",
            "accept-language": "ja,en-US;q=0.9,en;q=0.8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "TE": "trailers",
            "referer": "https://www.fanbox.cc/",
            "origin": "https://www.fanbox.cc"
        };
    }

    public async getPlanList() {
        try {
            const response = await fetch("https://api.fanbox.cc/relationship.listFilterOptions", {
                method: "GET",
                headers: this.header,
                body: null
            });
            if (response.status != 200) {
                throw new Error("FANBOX Error: " + response.status + " " + response.statusText);
            }
            const json = await response.json();
            const planList: any = {
                planList: [],
                planIdList: [],
            };
            for (const plan of json.body) {
                if (plan.planId != null) {
                    planList.planList.push(plan);
                    planList.planIdList.push(plan.planId);
                }
            }
            return planList;
        } catch (e) {
            throw e;
        }
    }

    public async getSupporterList() {
        try {
            const response = await fetch("https://api.fanbox.cc/relationship.listFans?status=supporter", {
                method: "GET",
                headers: this.header,
                body: null
            });
            if (response.status != 200) {
                throw new Error("FANBOX Error: " + response.status + " " + response.statusText);
            }
            const json = await response.json();
            const supporterList: any = {}
            for (const supporter of json.body) {
                if (supporter.user) {
                    if (!supporterList[supporter.planId]) {
                        supporterList[supporter.planId] = [];
                    }
                    supporterList[supporter.planId].push(supporter.user);
                }
            }
            return supporterList;
        } catch (e) {
            throw e;
        }
    }
}


