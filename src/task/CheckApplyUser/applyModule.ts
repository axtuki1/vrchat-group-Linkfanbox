export abstract class ApplyModule {

    public abstract roleIds: string[];

    public abstract checkAddRoles(userId: string, isSupporter: boolean, applyList: Record<string, boolean>): Promise<void>;

}