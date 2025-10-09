import * as fs from "fs";
const { parse } = require("jsonc-parser");
const config = (() => {
    const json = fs.readFileSync("./config/config.json");
    return parse(json.toString());
})();
import { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes } from "discord.js";
import { SlashCommand } from "./slashCommand";
import * as Commands from "./commands";
// import * as Permissions from "./permissions";
import { Logger } from "../../util/logger";
import rndstr from "rndstr";
import { PermissionData } from "./permission";
import { Task } from "../../task";

export class DiscordBotClient {

    private logger: Logger;
    public client: Client;
    private commands: SlashCommand[];
    private commandMap: Record<string, SlashCommand>;
    private permissions: {
        [key: string]: string[];
    };
    private token: string;
    private tasks: [string, Task][];

    constructor() {

        this.logger = new Logger("DiscordBotClient");

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
                command.processStartTimeStamp = new Date();
                command.processStartPerformance = performance.now();
                command.bot = this;
                await command.execute(interaction);
            } catch (error) {
                const errId = rndstr({ length: 10 });
                this.logger.error(`スラッシュコマンド実行時にエラーが発生しました。[ERRID: ${errId}]`);
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `コマンド実行中にエラーが発生しました。ERRID: ${errId}`, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: `コマンド実行中にエラーが発生しました。ERRID: ${errId}`, flags: MessageFlags.Ephemeral });
                }
            }
        });
    }

    public async login(token: string) {
        this.logger.info("Logging in to Discord...");
        await this.client.login(token);
        this.token = token;
    }

    public registerPermissions(permissions: PermissionData[]) {
        this.permissions = {};
        permissions.forEach(perm => {
            perm.userIds.forEach(userId => {
                if (!this.permissions[userId]) this.permissions[userId] = [];
                this.permissions[userId].push(perm.permissionId);
            });
        });
    }

    public getUserPermissions(userId: string): string[] {
        return this.permissions[userId] || [];
    }

    public hasPermission(userId: string, permission: string): boolean {
        const userPerms = this.getUserPermissions(userId);
        // 頭に"!"がついている場合は、その権限を持っていないことを確認する
        if (permission.startsWith("!")) {
            return !userPerms.includes(permission.substring(1));
        }
        return userPerms.includes(permission);
    }

    public async registerCommands(clientId: string, guildId: string) {

        if (!this.token) {
            throw new Error("Bot is not logged in.");
        }

        const rest = new REST().setToken(this.token);

        try {
            this.logger.info(`Started refreshing ${this.commands.length} application (/) commands.`);

            const commandData = [];
            for (const command of this.commands) {
                commandData.push(command.getSlashCommand().toJSON());
            }

            // The put method is used to fully refresh all commands in the guild with the current set
            const data: any = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commandData },
            );

            this.logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            this.logger.error("Error registering commands:");
            console.error(error);
        }

    }

    public registerTask(task: Task) {
        if (!this.tasks) this.tasks = [];
        const existingIndex = this.tasks.findIndex(([name, _]) => name === task.constructor.name);
        if( existingIndex !== -1 ) {
            this.logger.warn(`Task ${task.constructor.name} is already registered. Skipping duplicate registration.`);
            return;
        }
        this.tasks.push([task.constructor.name, task]);
    }

    public getTask<T extends Task>(taskClass: new (...args: any[]) => T): T | undefined {
        const taskName = taskClass.name;
        const taskEntry = this.tasks.find(([name, task]) => name === taskName);
        return taskEntry ? taskEntry[1] as T : undefined;
    }


}