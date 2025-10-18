import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { ApplyModule } from "../applyModule";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class EEWSettingApply extends ApplyModule {
    public roleIds: string[];

    constructor() {
        super();
        this.roleIds = config.settings.userSettings.roleId.eew_EnableIntensityOver3;
    }

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async checkAddRoles(userId: string, isSupporter: boolean, applyList: Record<string, boolean>): Promise<void> {

        // 支援者でなければ処理しない
        if (!isSupporter) return;

        const userSettings = await this.repo.getUserSettings(userId);
        for (const roleId of this.roleIds) {
            // ロールIDの頭が!の場合は反転
            if(roleId.startsWith("!")) {
                const actualRoleId = roleId.substring(1);
                if (userSettings.eew_EnableIntensityOver3) {
                    applyList[actualRoleId] = false;
                } else {
                    applyList[actualRoleId] = true;
                }
            } else {
                if (userSettings.eew_EnableIntensityOver3) {
                    applyList[roleId] = true;
                } else {
                    applyList[roleId] = false;
                }
            }
        }
    }

}