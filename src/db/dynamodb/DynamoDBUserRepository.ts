import { User } from "../../bean/User";
import { UserRepositoryInterface } from "../interfaces/UserRepositoryInterface";
import { DynamoDBBaseRepository } from "./DynamoDBBaseRepository";
import { GetCommand, GetCommandInput, PutCommand, QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import uuid from "ui7";

export class DynamoDBUserRepository extends DynamoDBBaseRepository implements UserRepositoryInterface {

    
    updateUser(userId: string, data: { vrchatDisplayName?: string; vrchatUserId?: string; pixivUserId?: string; fanboxPlanId?: string | null; }): Promise<any> {
        throw new Error("Method not implemented.");
    }


    async getUserById(userId: string): Promise<any> {

        const params: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                userId: userId
            }
        }
        try {
            const data = await this.documentClient.send(
                new GetCommand(params)
            );
            if (data.Item) {
                return {
                    userId: data.Item.userId,
                    vrchatDisplayName: data.Item.vrchatDisplayName,
                    vrchatUserId: data.Item.vrchatUserId,
                    pixivUserId: data.Item.pixivUserId,
                    createdAt: new Date(data.Item.createdAt),
                    updatedAt: new Date(data.Item.updatedAt),
                    fanboxPlanId: data.Item.fanboxPlanId
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getUserByPixivId(pixivUserId: string): Promise<any> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            IndexName: this.pixivUserIdIndexName,
            KeyConditionExpression: "pixivUserId = :pixivUserId",
            ExpressionAttributeValues: {
                ":pixivUserId": pixivUserId
            }
        };
        try {
            const data = await this.documentClient.send(
                new QueryCommand(params)
            )
            if (data.Items && data.Items.length > 0) {
                return data.Items[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getUserByVrchatId(vrchatUserId: string): Promise<any> {
        const params: QueryCommandInput = {
            TableName: this.tableName,
            IndexName: this.vrchatUserIdIndexName,
            KeyConditionExpression: "vrchatUserId = :vrchatUserId",
            ExpressionAttributeValues: {
                ":vrchatUserId": vrchatUserId
            }
        };
        try {
            const data = await this.documentClient.send(
                new QueryCommand(params)
            )
            if (data.Items && data.Items.length > 0) {
                return data.Items[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getRegisteredUsers(): Promise<any> {
        const params: ScanCommandInput = {
            TableName: this.tableName,
        };
        try {
            const data = await this.documentClient.send(
                new ScanCommand(params)
            )
            if (data.Items && data.Items.length > 0) {
                return data.Items;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async getRegisteredUsersByFanboxPlanId(fanboxPlanId: string): Promise<any> {
        const params: ScanCommandInput = {
            TableName: this.tableName,
            FilterExpression: "fanboxPlanId = :fanboxPlanId",
            ExpressionAttributeValues: {
                ":fanboxPlanId": fanboxPlanId
            }
        };
        try {
            const data = await this.documentClient.send(
                new ScanCommand(params)
            )
            if (data.Items && data.Items.length > 0) {
                return data.Items;
            } else {
                return null;
            }
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
            new Date(),
            fanboxPlanId
        );

        const params = {
            TableName: this.tableName,
            Item: {
                userId: uuid(),
                vrchatDisplayName: user.vrchatDisplayName,
                vrchatUserId: user.vrchatUserId,
                pixivUserId: user.pixivUserId,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                fanboxPlanId: user.fanboxPlanId
            }
        }
        try {
            const data = await this.documentClient.send(
                new PutCommand(params)
            );
            return {
                result: data,
                user: user
            };
        } catch (error) {
            console.error("Error:", error);
        }
    }
}