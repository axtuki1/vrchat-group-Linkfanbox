import { User } from "../../bean/User";


export interface UserRepositoryInterface {
    registerUser(
        vrchatDisplayName: string,
        vrchatUserId: string,
        pixivUserId: string,
        fanboxPlanId: string | null,
        planUpdateAt: Date
    ): Promise<any>;
    updateUser(
        userId: string,
        data: {
            vrchatDisplayName?: string;
            vrchatUserId?: string;
            pixivUserId?: string;
            fanboxPlanId?: string | null;
            planUpdateAt?: Date;
        }
    ): Promise<any>;
    getUserByPixivId(pixivUserId: string): Promise<any>;
    getUserByVrchatId(vrchatUserId: string): Promise<any>;
    getUserById(userId: string): Promise<any>;
    getRegisteredUsers(): Promise<any>;
    getRegisteredUsersByFanboxPlanId(fanboxPlanId: string): Promise<any>;
}