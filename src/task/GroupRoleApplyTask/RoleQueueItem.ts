import { User } from "../../bean/User";

export class RoleQueueItem {
    public user: User;
    public groupId: string;
    public roles: Record<string, boolean>;
}