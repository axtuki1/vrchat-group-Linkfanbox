import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { SlashCommand } from "./slashCommand";
import * as Commands from "./commands";
import { Logger } from "../../util/logger";
import rndstr from "rndstr";

export class DiscordBotClient {

    private logger: Logger;
    private client: Client;
    private commands: SlashCommand[];
    private commandMap: Record<string, SlashCommand>

    constructor() {
        

        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        // スラッシュコマンドの登録
        this.commands = Object.values(Commands).map((Cmd: any) => new Cmd());
        this.commandMap = Object.fromEntries(
            this.commands.map(cmd => [cmd.name, cmd])
        );

        this.client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;
            const command = this.commandMap[interaction.commandName];

            if (!command) {
                this.logger.error(`不明なコマンド"${interaction.commandName}"が呼ばれました。`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                const errId = rndstr({length: 10});
                this.logger.error(`スラッシュコマンド実行時にエラーが発生しました。[ERRID: ${errId}]`);
                this.logger.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `コマンド実行中にエラーが発生しました。ERRID: ${errId}`, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: `コマンド実行中にエラーが発生しました。ERRID: ${errId}`, flags: MessageFlags.Ephemeral });
                }
            }
        });
    }

    public login(token: string) {
        this.client.login(token);
    }

}