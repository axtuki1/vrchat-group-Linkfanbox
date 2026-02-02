import { ContainerBuilder } from "discord.js";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export abstract class Container {
    protected config = config;

    public abstract render(userSettings?): ContainerBuilder;
}