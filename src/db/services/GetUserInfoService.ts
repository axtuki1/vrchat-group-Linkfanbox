import { User } from "../../bean/User";
import { UserRepositoryInterface } from "../interfaces/UserRepositoryInterface";

export class GetUserInfoService {
    constructor(private userRepository: UserRepositoryInterface) {}

    async getUserInfo(userId: string): Promise<User> {
        try {
            const user = await this.userRepository.getUserById(userId);
            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    /**
     * PixivのユーザーIDでユーザーを取得します。 
     * @deprecated FANBOXから直接のデータ取得を廃止し、Discordのロールから加入プランの取得をするため、このメソッドは将来的に削除されます。
     */
    async getUserInfoByPixivId(pixivUserId: string): Promise<User> {
        try {
            const user = await this.userRepository.getUserByPixivId(pixivUserId);
            if (!user) {
                return null;
            }
            return new User(
                user.userId,
                user.vrchatDisplayName,
                user.vrchatUserId,
                user.pixivUserId,
                user.discordUserId,
                user.createAt,
                user.updateAt,
                user.planUpdateAt,
                user.fanboxPlanId,
            );;
        } catch (error) {
            console.error('Error fetching user info by Pixiv ID:', error);
            throw error;
        }
    }

    async getUserInfoByVrchatId(vrchatUserId: string): Promise<User> {
        try {
            const user = await this.userRepository.getUserByVrchatId(vrchatUserId);
            if (!user) {
                return null;
            };
            return new User(
                user.userId,
                user.vrchatDisplayName,
                user.vrchatUserId,
                user.pixivUserId,
                user.discordUserId,
                user.createAt,
                user.updateAt,
                user.planUpdateAt,
                user.fanboxPlanId,
            );;
        } catch (error) {
            console.error('Error fetching user info by VRChat ID:', error);
            throw error;
        }
    }

    async getUserInfoByDiscordId(discordUserId: string): Promise<User> {
        try {
            const user = await this.userRepository.getUserByDiscordId(discordUserId);
            if (!user) {
                return null;
            }
            return new User(
                user.userId,
                user.vrchatDisplayName,
                user.vrchatUserId,
                user.pixivUserId,
                user.discordUserId,
                user.createAt,
                user.updateAt,
                user.planUpdateAt,
                user.fanboxPlanId,
            );;
        } catch (error) {
            console.error('Error fetching user info by Discord ID:', error);
            throw error;
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const users = await this.userRepository.getAllUsers();
            const userList: User[] = users.map((user) => {
                return new User(
                    user.userId,
                    user.vrchatDisplayName,
                    user.vrchatUserId,
                    user.pixivUserId,
                    user.discordUserId,
                    user.createAt,
                    user.updateAt,
                    user.planUpdateAt,
                    user.fanboxPlanId,
                );
            });
            if (!userList) {
                return new User[0];
            }
            return userList;
        } catch (error) {
            console.error('Error fetching registered users:', error);
            throw error;
        }
    }

    async getAllUsersWithDiscordId(): Promise<User[]> {
        try {
            const users = await this.userRepository.getAllUsersWithDiscordId();
            const userList: User[] = users.map((user) => {
                return new User(
                    user.userId,
                    user.vrchatDisplayName,
                    user.vrchatUserId,
                    user.pixivUserId,
                    user.discordUserId,
                    user.createAt,
                    user.updateAt,
                    user.planUpdateAt,
                    user.fanboxPlanId,
                );
            });
            if (!userList) {
                return new User[0];
            }
            return userList;
        } catch (error) {
            console.error('Error fetching registered users with Discord ID:', error);
            throw error;
        }
    }

    async getAllUserWithVrchatId(): Promise<User[]> {
        try {
            const users = await this.userRepository.getAllUserWithVrchatId();
            const userList: User[] = users.map((user) => {
                return new User(
                    user.userId,
                    user.vrchatDisplayName,
                    user.vrchatUserId,
                    user.pixivUserId,
                    user.discordUserId,
                    user.createAt,
                    user.updateAt,
                    user.planUpdateAt,
                    user.fanboxPlanId,
                );
            });
            if (!userList) {
                return new User[0];
            }
            return userList;
        } catch (error) {
            console.error('Error fetching registered users with VRChat ID:', error);
            throw error;
        }
    }

    async getPlanAvailableUsers(): Promise<User[]> {
        try {
            const users = await this.userRepository.getPlanAvailableUsers();
            const userList: User[] = users.map((user) => {
                return new User(
                    user.userId,
                    user.vrchatDisplayName,
                    user.vrchatUserId,
                    user.pixivUserId,
                    user.discordUserId,
                    user.createAt,
                    user.updateAt,
                    user.planUpdateAt,
                    user.fanboxPlanId,
                );
            });
            if (!userList) {
                return new User[0];
            }
            return userList;
        } catch (error) {
            console.error('Error fetching plan available users:', error);
            throw error;
        }
    }

    async updateUser(
        userId: string,
        data: {
            vrchatDisplayName?: string | null;
            vrchatUserId?: string | null;
            pixivUserId?: string | null;
            discordUserId?: string | null;
            fanboxPlanId?: string | null;
            planUpdateAt?: Date;
        }
    ): Promise<void> {
        try {
            const user = await this.userRepository.updateUser(userId, data);
            return;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async registerUser(
        vrchatUserId: string,
        pixivUserId: string | null = null,
        vrchatDisplayName: string = "",
        discordUserId: string | null = null,
        fanboxPlanId: string = "",
        planUpdateAt: Date = new Date()
    ): Promise<void> {
        try {
            const user = await this.userRepository.registerUser(
                vrchatDisplayName,
                vrchatUserId,
                pixivUserId,
                discordUserId,
                fanboxPlanId,
                planUpdateAt
            );
            return;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    async getUserSettings(userId: string): Promise<any> {
        try {
            const settings = await this.userRepository.getUserSettings(userId);

            settings.eew_EnableIntensityOver3 = Boolean(parseInt(settings.eew_EnableIntensityOver3));

            return settings;
        } catch (error) {
            console.error('Error fetching user settings:', error);
            throw error;
        }
    }

    async getUserSettingsByDiscordId(discordUserId: string): Promise<any> {
        try {
            const user = await this.userRepository.getUserByDiscordId(discordUserId);
            if (!user) {
                return null;
            }
            const settings = await this.getUserSettings(user.userId);
            return settings;
        } catch (error) {
            console.error('Error fetching user settings by Discord ID:', error);
            throw error;
        }
    }

    async updateUserSettings(
        userId: string,
        settings: {
            eew_EnableIntensityOver3?: boolean;
            eew_CustomIntensitySetting?: string;
        }
    ): Promise<void> {
        try {
            await this.userRepository.updateUserSettings(userId, settings);
            return;
        } catch (error) {
            console.error('Error updating user settings:', error);
            throw error;
        }
    }

    async updateUserSettingsByDiscordId(
        discordUserId: string,
        settings: {
            eew_EnableIntensityOver3?: boolean;
            eew_CustomIntensitySetting?: string;
        }
    ): Promise<void> {
        try {
            const user = await this.userRepository.getUserByDiscordId(discordUserId);
            if (!user) {
                throw new Error('User not found');
            }
            await this.updateUserSettings(user.userId, settings);
            return;
        } catch (error) {
            console.error('Error updating user settings by Discord ID:', error);
            throw error;
        }
    }

}