import { User } from "../../bean/User";

export abstract class ApplyModule {

    public abstract roleIds: string[];

    public abstract checkAddRoles(userId: User, isSupporter: boolean, applyList: Record<string, boolean>): Promise<void>;

}