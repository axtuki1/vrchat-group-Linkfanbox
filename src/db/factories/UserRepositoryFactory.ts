import { DynamoDBUserRepository } from "../dynamodb/DynamoDBUserRepository";
import { UserRepositoryInterface } from "../interfaces/UserRepositoryInterface";
import * as fs from "fs";
import { MySQLUserRepository } from "../mysql/MySQLUserRepository";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class UserRepositoryFactory {

    private static instance: UserRepositoryInterface = null;

    static create(): UserRepositoryInterface {
        if (!this.instance) {
            switch (config.database.use) {
                case "dynamodb":
                    this.instance = new DynamoDBUserRepository(
                        config.database.dynamoDB.tableName,
                        config.database.dynamoDB.indexName.pixivId,
                        config.database.dynamoDB.indexName.vrchatId,
                        config.database.dynamoDB.region
                    );
                default:
                    this.instance = new MySQLUserRepository(
                        config.database.mysql.host,
                        config.database.mysql.user,
                        config.database.mysql.password,
                        config.database.mysql.database,
                        config.database.mysql.port || 3306
                    );
            }
        }
        
        return this.instance;
    }
}