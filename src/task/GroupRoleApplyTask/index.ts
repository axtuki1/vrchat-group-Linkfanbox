import { Logger } from "../../util/logger";
import { VRChat } from "../../vrchat";
import { Task } from "..";
import { RoleQueueItem } from "./RoleQueueItem";
import { User } from "../../bean/User";
import { GetUserInfoService } from "../../db/services/GetUserInfoService";
import { UserRepositoryFactory } from "../../db/factories/UserRepositoryFactory";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

/**
 * VRChatのグループに対しロール付与/剥奪を行うタスク。
 */
export class GroupRoleApplyTask extends Task {

    private logger: Logger = new Logger("GroupRoleApplyTask");
    private vrchat: VRChat;
    private queue: RoleQueueItem[] = [];
    private isProcessing: boolean = false;
    private repo: GetUserInfoService = new GetUserInfoService(UserRepositoryFactory.create());

    constructor(vrchat: VRChat, errorHandler: Function = null) {
        super(errorHandler);
        this.vrchat = vrchat;
        this.queue = [];
    }

    public async execute(): Promise<void> {
        if (this.queue.length == 0 || this.isProcessing || !this.vrchat.isLogin) {
            return;
        }
        this.isProcessing = true;
        try {
            const { user, groupId, roles } = this.queue.shift();
            if (!user || !roles) {
                return;
            }
            if (config.settings.ignoreUsers && config.settings.ignoreUsers[groupId] && config.settings.ignoreUsers[groupId].includes(user.vrchatUserId)) {
                this.logger.info("[" + user.vrchatUserId + "] User is in ignore list. Skipping role application.");
                return;
            }
            this.logger.info("Processing user: " + user.vrchatUserId + " (" + user.userId + ")");
            const groupMember = await this.vrchat.GetGroupMember(groupId, user.vrchatUserId);
            this.sleep(500);
            const userInfo = await this.vrchat.GetUserInfo(user.vrchatUserId);
            if (!user.vrchatDisplayName || user.vrchatDisplayName != userInfo.displayName) {
                await this.repo.updateUser(
                    user.userId,
                    { vrchatDisplayName: userInfo.displayName }
                );
                this.logger.info("[" + user.vrchatUserId + "] Updated display name: " + userInfo.displayName);
            }
            if (!groupMember) {
                this.logger.info("[" + user.vrchatUserId + "] User not found in group.");
                return;
            }
            this.logger.info("[" + user.vrchatUserId + "] User found in group: " + groupMember.userId);
            

            const groupRolesIds = groupMember.roleIds;
            Object.keys(roles).forEach(async (roleId) => {
                if (roles[roleId] && !groupRolesIds.includes(roleId)) {
                    await this.vrchat.AddGroupRole(groupId, roleId, user.vrchatUserId);
                    this.logger.info("[" + user.vrchatUserId + "] Added role: " + roleId);
                } else if (!roles[roleId] && groupRolesIds.includes(roleId)) {
                    await this.vrchat.RemoveGroupRole(groupId, roleId, user.vrchatUserId);
                    this.logger.info("[" + user.vrchatUserId + "] Removed role: " + roleId);
                } else {
                    this.logger.info("[" + user.vrchatUserId + "] Role already set: " + roleId);
                }
                await this.sleep(1000);
            });
        } catch (e) {
            throw e;
        } finally {
            this.isProcessing = false;
        }
    }

    public AddQueue(user: User, groupId: string, roles: Record<string, boolean>) {
        this.queue.push({ user, groupId, roles });
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}