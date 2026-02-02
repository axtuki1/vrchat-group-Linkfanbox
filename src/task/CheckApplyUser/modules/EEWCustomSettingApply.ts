import { User } from "../../../bean/User";
import { UserRepositoryFactory } from "../../../db/factories/UserRepositoryFactory";
import { GetUserInfoService } from "../../../db/services/GetUserInfoService";
import { ApplyModule } from "../applyModule";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class EEWCustomSettingApply extends ApplyModule {

    public roleIds: string[];
    private featureSwitch: boolean;

    constructor() {
        super();
        this.roleIds = Object.values(config.settings.eew_CustomIntensity.roleIds).flat() as string[];
        this.featureSwitch = config.feature.EnableEEWNoticeIntensityCustom;
    }

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async checkAddRoles(user: User, isSupporter: boolean, applyList: Record<string, boolean>): Promise<void> {

        // 支援者でなければ処理しない
        if (!isSupporter) return;

        // プランIDが含まれていない場合は処理しない
        const availablePlanIds: string[] = config.settings.eew_CustomIntensity.availablePlanId;

        const userSettings = await this.repo.getUserSettings(user.userId);

        if (!availablePlanIds.includes(user.fanboxPlanId)) return;

        // 震度カスタマイズ機能有効時
        const roleIdList = config.settings.eew_CustomIntensity.roleIds;
        for(const id of Object.keys(roleIdList)) {
            const roleId = roleIdList[id];
            if (this.featureSwitch) {
                // ロールIDの頭が!の場合は反転
                if (roleId.startsWith("!")) {
                    const actualRoleId = roleId.substring(1);
                    if (userSettings.eew_CustomIntensitySetting == id) {
                        applyList[actualRoleId] = false;
                    } else {
                        applyList[actualRoleId] = true;
                    }
                } else {
                    if (userSettings.eew_CustomIntensitySetting == id) {
                        applyList[roleId] = true;
                    } else {
                        applyList[roleId] = false;
                    }
                }
            } else {
                // 震度カスタマイズ機能無効時は全て外す
                if (roleId.startsWith("!")) {
                    const actualRoleId = roleId.substring(1);
                    if (actualRoleId in applyList) continue;
                    applyList[actualRoleId] = false;
                } else {
                    if (roleId in applyList) continue;
                    applyList[roleId] = false;
                }
            }
        };
    }
}