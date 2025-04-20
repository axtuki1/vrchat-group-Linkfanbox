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
                user.createAt,
                user.updateAt,
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
                user.createAt,
                user.updateAt,
                user.fanboxPlanId,
            );;
        } catch (error) {
            console.error('Error fetching user info by VRChat ID:', error);
            throw error;
        }
    }

    async getRegisteredUsers(): Promise<User[]> {
        try {
            const users = await this.userRepository.getRegisteredUsers();
            const userList: User[] = users.map((user) => {
                return new User(
                    user.userId,
                    user.vrchatDisplayName,
                    user.vrchatUserId,
                    user.pixivUserId,
                    user.createAt,
                    user.updateAt,
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

    async updateUser(
        userId: string,
        data: {
            vrchatDisplayName?: string;
            vrchatUserId?: string;
            pixivUserId?: string;
            fanboxPlanId?: string | null;
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
        pixivUserId: string,
        vrchatDisplayName: string = "",
        fanboxPlanId: string = ""
    ): Promise<void> {
        try {
            const user = await this.userRepository.registerUser(
                vrchatDisplayName,
                vrchatUserId,
                pixivUserId,
                fanboxPlanId
            );
            return;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }
}