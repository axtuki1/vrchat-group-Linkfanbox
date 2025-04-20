import { Logger } from "../../util/logger";
import { VRChat } from "../../vrchat";
import { Task } from "..";
import { RoleQueueItem } from "./RoleQueueItem";

export class GroupRoleApplyTask extends Task {

    private logger: Logger = new Logger("GroupRoleApplyTask");
    private vrchat: VRChat;
    private queue: RoleQueueItem[] = [];
    private isProcessing: boolean = false;

    constructor(vrchat: VRChat, errorHandler: Function = null) {
        super(errorHandler);
        this.vrchat = vrchat;
        this.queue = [];
    }

    public async execute(): Promise<void> {
        if (this.queue.length == 0 || this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        try {
            const { userId, groupId, roles } = this.queue.shift();
            if (!userId || !roles) {
                return;
            }
            const groupMember = await this.vrchat.GetGroupMember(groupId, userId);
            if (!groupMember) {
                this.logger.info("[" + userId + "] User not found in group.");
                return;
            } else {
                this.logger.info("[" + userId + "] User found in group: " + groupMember.userId);
            }
            const groupRolesIds = groupMember.roleIds;
            Object.keys(roles).forEach(async (roleId) => {
                if (roles[roleId] && !groupRolesIds.includes(roleId)) {
                    await this.vrchat.AddGroupRole(groupId, roleId, userId);
                    this.logger.info("[" + userId + "] Added role: " + roleId);
                } else if (!roles[roleId] && groupRolesIds.includes(roleId)) {
                    await this.vrchat.RemoveGroupRole(groupId, roleId, userId);
                    this.logger.info("[" + userId + "] Removed role: " + roleId);
                } else {
                    this.logger.info("[" + userId + "] Role already set: " + roleId);
                }
                await this.sleep(1000);
            });
        } catch (e) {
            throw e;
        } finally {
            this.isProcessing = false;
        }
    }

    public AddQueue(userId: string, groupId: string, roles: Record<string, boolean>) {
        this.queue.push({ userId, groupId, roles });
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}