import { User } from "../../bean/User";
import { UserRepositoryInterface } from "../interfaces/UserRepositoryInterface";
import { MySQLBaseRepository } from "./MySQLBaseRepository";
import uuid from "ui7";

export class MySQLUserRepository extends MySQLBaseRepository implements UserRepositoryInterface {


    async getUserById(userId: string): Promise<any> {
        try {
            const res = await this.connection.execute(
                `SELECT * FROM users WHERE userId = ?`,
                [userId]
            );
            if (!res || res.length === 0) {
                return null;
            }
            if (res[0][0].length === 0) {
                return null;
            }
            return res[0][0];
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getUserByPixivId(pixivUserId: string): Promise<any> {
        try {
            const res = await this.connection.query(
                `SELECT * FROM users WHERE pixivUserId = ?`,
                [pixivUserId]
            );
            if (!res || res.length === 0) {
                return null;
            }
            if (res[0].length === 0) {
                return null;
            }
            return res[0][0];
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getUserByVrchatId(vrchatUserId: string): Promise<any> {
        try {
            const res = await this.connection.query(
                `SELECT * FROM users WHERE vrchatUserId = ?`,
                [vrchatUserId]
            );
            if (!res || res.length === 0) {
                return null;
            }
            if (res[0].length === 0) {
                return null;
            }
            return res[0][0];
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getRegisteredUsers(): Promise<any> {
        try {
            const res = await this.connection.query(
                `SELECT * FROM users WHERE updateAt >= DATE_ADD(now(), INTERVAL -1 MONTH)`
            );
            return res[0];
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getRegisteredUsersByFanboxPlanId(fanboxPlanId: string): Promise<any> {
        try {
            const res = await this.connection.query(
                `SELECT * FROM users WHERE fanboxPlanId = ? AND updateAt >= DATE_ADD(now(), INTERVAL -1 MONTH)`,
                [fanboxPlanId]
            );
            return res[0];
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async updateUser(userId: string, data: {
        vrchatDisplayName?: string,
        vrchatUserId?: string,
        pixivUserId?: string,
        fanboxPlanId?: string | null
    }): Promise<any> {
        try {
            const fields = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(", ");
            const values = Object.values(data);
            const res = await this.connection.query(
                `UPDATE users SET ${fields}, updateAt = NOW() WHERE userId = ?`,
                [...values, userId]
            );
            return res;
        } catch (error) {
            console.error("Error:", error);
        }  
    }

    async registerUser(
        vrchatDisplayName: string,
        vrchatUserId: string,
        pixivUserId: string,
        fanboxPlanId: string | null = null
    ): Promise<any> {

        const user = new User(
            uuid(),
            vrchatDisplayName,
            vrchatUserId,
            pixivUserId,
            new Date(),
            new Date(),
            fanboxPlanId
        );

        try {
            const res = await this.connection.query(
                `INSERT INTO users (userId, vrchatUserId, pixivUserId, fanboxPlanId, createAt, updateAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
                [user.userId, user.vrchatUserId, user.pixivUserId, user.fanboxPlanId]
            );
            return res;
        } catch (error) {
            console.error("Error:", error);
        }
    }
}