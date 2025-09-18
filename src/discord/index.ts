import { DiscordBotClient } from "./client";
import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();

export class Discord {

    private webhookUrl: string = null;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }

    public async sendMessage(message: string) {
        const response = await fetch(this.webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: message
            })
        });
        if (response.status !== 204) {
            throw new Error("Failed to send message to Discord webhook. Status code: " + response.status);
        }
    }

    public static genDiscordBot(token: string): DiscordBotClient{
        const bot = new DiscordBotClient();
        bot.login(token);
        return bot;
    }

}
