import * as fs from "fs";
import { MySQLUserRepository } from "../mysql/MySQLUserRepository";
import { ProductRepositoryInterface } from "../interfaces/ProductRepositoryInterface";
import { MySQLProductRepository } from "../mysql/MySQLProductRepository";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class ProductRepositoryFactory {

    private static instance: ProductRepositoryInterface = null;

    static create(): ProductRepositoryInterface {
        if (!this.instance) {
            switch (config.database.use) {
                case "dynamodb":
                    // do nothing
                    break;
                default:
                    this.instance = new MySQLProductRepository(
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