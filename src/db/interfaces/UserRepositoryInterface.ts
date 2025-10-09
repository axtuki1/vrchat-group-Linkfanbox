import { User } from "../../bean/User";


export interface UserRepositoryInterface {
    /**
     * ユーザーを新規登録します。
     * @param vrchatDisplayName VRChatの表示名
     * @param vrchatUserId VRChatのユーザーID
     * @param pixivUserId PixivのユーザーID
     * @param discordUserId DiscordのユーザーID
     * @param fanboxPlanId ファンボックスのプランID
     * @param planUpdateAt プラン更新日時
     */
    registerUser(
        vrchatDisplayName: string,
        vrchatUserId: string,
        pixivUserId: string,
        discordUserId: string | null,
        fanboxPlanId: string | null,
        planUpdateAt: Date
    ): Promise<any>;
    /**
     * ユーザー情報を更新します。
     * @param userId ユーザーID
     * @param data 更新するデータ
     */
    updateUser(
        userId: string,
        data: {
            vrchatDisplayName?: string;
            vrchatUserId?: string;
            pixivUserId?: string;
            discordUserId?: string | null;
            fanboxPlanId?: string | null;
            planUpdateAt?: Date;
        }
    ): Promise<any>;
    /**
     * PixivのユーザーIDでユーザーを取得します。
     * @param pixivUserId PixivのユーザーID
     * @deprecated FANBOXから直接のデータ取得を廃止し、Discordのロールから加入プランの取得をするため、このメソッドは将来的に削除されます。
     */
    getUserByPixivId(pixivUserId: string): Promise<any>;
    /**
     * VRChatのユーザーIDでユーザーを取得します。
     * @param vrchatUserId VRChatのユーザーID
     */
    getUserByVrchatId(vrchatUserId: string): Promise<any>;
    /**
     * DiscordのユーザーIDでユーザーを取得します。
     * @param discordUserId DiscordのユーザーID
     */
    getUserByDiscordId(discordUserId: string): Promise<any>;
    /**
     * 指定のユーザーIDのユーザーを取得します。
     * @param userId ユーザーID
     */
    getUserById(userId: string): Promise<any>;
    /**
     * すべてのユーザーを取得します。
     */
    getAllUsers(): Promise<any>;
    /**
     * DiscordのユーザーIDが登録されているユーザーをすべて取得します。
     */
    getAllUsersWithDiscordId(): Promise<any>;
    /**
     * VRChatのユーザーIDが登録されているユーザーをすべて取得します。
     */
    getAllUserWithVrchatId(): Promise<any>;
    /**
     * プラン加入状態が確認できているユーザーをすべて取得します。（1ヶ月以内にプラン加入状態が確認できたユーザー）
     */
    getPlanAvailableUsers(): Promise<any>;
    /**
     * 1ヶ月以内にプラン更新があった、指定のファンボックスプランIDのユーザーを取得します。
     * @param fanboxPlanId ファンボックスのプランID
     */
    getPlanAvailableUsersByFanboxPlanId(fanboxPlanId: string): Promise<any>;
}