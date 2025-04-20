import * as fs from "fs";
import * as path from "path";

export class Logger {

    private levelPriority = {
        "debug": 0, "info": 1, "warn": 2, "error": 3
    }

    private sender;
    public static level: "info" | "debug" | "warn" | "error" = "info";
    public static logFilePath: string = "./log/%year-%month-%date.log";

    constructor(sender) {
        this.sender = sender;
    }

    public info(obj) {
        this.log("info", obj);
    }

    public debug(obj) {
        this.log("debug", obj);
    }

    public warn(obj) {
        this.log("warn", obj);
    }

    public error(obj) {
        this.log("error", obj);
    }

    public log(level, obj) {
        if (this.levelPriority[Logger.level] > this.levelPriority[level]) return;
        let sender = this.sender;
        let nowTime = new Date().toLocaleDateString("ja-JP", {
            year: "numeric", month: "2-digit",
            day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
        if (sender != "") {
            sender = "[" + sender + "] ";
        }
        sender = `[${nowTime}] [${level.toUpperCase()}] ${sender}`;
        if (typeof obj === "string") {
            console.log(sender + "%s", obj);
            Logger.printFile(this.sender, sender + obj);
        } else if (typeof obj === "number") {
            if (Number.isInteger(obj)) {
                console.log(sender + "%i", obj);
            } else {
                console.log(sender + "%f", obj);
            }
            Logger.printFile(this.sender, sender + obj.toString());
        } else {
            console.log(sender + "%o", JSON.parse(JSON.stringify(obj)));
            Logger.printFile(this.sender, sender + JSON.stringify(obj));
        }
    }

    private static printFile(sender, data) {
        if (!Logger.logFilePath) return;
        if (fs.existsSync(Logger.logFilePath) == false) {
            fs.mkdirSync(path.dirname(Logger.logFilePath), { recursive: true });
        }
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const logFilePath = Logger.logFilePath
            .replace("%year", year.toString())
            .replace("%month", month)
            .replace("%date", day);

        fs.appendFile(logFilePath, data + "\n", (err) => {
            if (err) {
                console.error("Error writing to log file:", err);
            }
        });
    }

}