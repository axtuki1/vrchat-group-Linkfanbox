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

export class EEWSettingApply extends ApplyModule {

    public over3_roleIds: string[];
    public custom_roleIds: Record<string, string[]> = {};
    private featureSwitch: boolean;

    constructor() {
        super();
        this.over3_roleIds = config.settings.eew_EnableIntensityOver3.roleId;
        this.custom_roleIds = config.settings.eew_CustomIntensity.roleIds;
        this.featureSwitch = config.feature.EnableEEWNoticeIntensityCustom;
    }

    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    public async checkAddRoles(user: User, isSupporter: boolean, applyList: Record<string, boolean>): Promise<void> {

        // 支援者でなければ処理しない
        if (!isSupporter) return;

        // プランIDが含まれていない場合は処理しない
        const availablePlanIds: string[] = config.settings.eew_EnableIntensityOver3.availablePlanId;
        if (!availablePlanIds.includes(user.fanboxPlanId)) return;

        const userSettings = await this.repo.getUserSettings(user.userId);
        if (this.featureSwitch) {
            // 震度カスタマイズ機能有効時

        } else {
            // 震度カスタマイズ機能無効時
            for (const roleId of this.over3_roleIds) {
                // ロールIDの頭が!の場合は反転
                if (roleId.startsWith("!")) {
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

}