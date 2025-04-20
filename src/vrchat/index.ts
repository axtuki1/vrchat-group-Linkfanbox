import * as fs from "fs";
import * as path from "path";
import * as OTPAuth from "otpauth";
import { Logger } from "../util/logger";
import { LoginFailureException } from "./exception/LoginFailureException";
import { RequireLoginException } from "./exception/RequireLoginException";

export class VRChat {

    /**
     * VRChat APIを利用するためのクラス
     */

    private apiKey: string;
    private eMail: string;
    private password: string;
    private userAgent: string;
    private secretFolder: string;
    private otpUrl: string = null;

    public isLogin: boolean = false;
    public isTwoFactorAuth: boolean = false;
    public userData: any = null;

    private authCookie: string = null;
    private twoFactorAuth: string = null;
    private otpType: string[] = [];
    private TOTPHandler: OTPAuth.TOTP | OTPAuth.HOTP = null;

    private logger: Logger = new Logger("VRChatAPI");

    constructor(apiKey: string, eMail: string, password: string, userAgent: string, secretFolder: string = "secret", OTPUrl: string = null) {
        this.secretFolder = secretFolder;
        if (!fs.existsSync(secretFolder)) {
            fs.mkdirSync(secretFolder);
        }
        this.apiKey = apiKey;
        this.eMail = eMail;
        this.password = password;
        this.userAgent = userAgent;
        this.otpUrl = OTPUrl;
        if (this.otpUrl != null) {
            this.TOTPHandler = OTPAuth.URI.parse(this.otpUrl);
        }

        if (fs.existsSync(path.join(secretFolder, "authCookie.txt"))) {
            this.authCookie = fs.readFileSync(path.join(secretFolder, "authCookie.txt")).toString();
        }
        if (fs.existsSync(path.join(secretFolder, "twoFactorAuth.txt"))) {
            this.twoFactorAuth = fs.readFileSync(path.join(secretFolder, "twoFactorAuth.txt")).toString();
        }

    }

    private GetRequestHeader() {
        return {
            "Content-Type": "application/json",
            "User-Agent": this.userAgent,
            "Cookie": "apiKey=" + this.apiKey + "; auth=" + this.authCookie + "; twoFactorAuth=" + this.twoFactorAuth,
        };
    }

    //#region Auth

    public async LoginCheck() {
        try {
            this.logger.debug("Login check to VRChat API");
            const response = await fetch("https://api.vrchat.cloud/api/1/auth/user", {
                headers: this.GetRequestHeader()
            });

            if (response.status == 200) {
                const json = await response.json();

                if (json.requiresTwoFactorAuth) {
                    this.isLogin = false;
                    return {
                        requiresTwoFactorAuth: json.requiresTwoFactorAuth
                    };
                }

                this.isLogin = true;
                this.userData = json;

                return {
                    userData: json,
                    isLogin: this.isLogin,
                };
            }

            this.isLogin = false;
            throw new LoginFailureException("Login check failed: " + response.statusText);

        } catch (e) {
            throw e;
        }
    }

    public async Login() {
        try {
            this.logger.debug("Login to VRChat API");
            const response = await fetch("https://api.vrchat.cloud/api/1/auth/user", {
                headers: {
                    "User-Agent": this.userAgent,
                    "Content-Type": "application/json",
                    "Cookie": "apiKey=" + this.apiKey,
                    credentials: "same-origin",
                    Authorization: 'Basic ' + Buffer.from(encodeURIComponent(this.eMail) + ":" + encodeURIComponent(this.password)).toString("base64")
                },
            });

            if (response.status === 200) {
                this.authCookie = response.headers.get("Set-Cookie").match(/auth=(.*?);/)[1];
                fs.writeFileSync(
                    path.join(this.secretFolder, "authCookie.txt"),
                    this.authCookie
                );
                
                this.isLogin = true;
                const json = await response.json();

                if (json == null) {
                    throw new LoginFailureException("Login failed: [" + response.status + " " + response.statusText + "] ");
                }
                if (json.requiresTwoFactorAuth) {
                    this.isLogin = false;
                    this.isTwoFactorAuth = true;
                    this.otpType = json.requiresTwoFactorAuth;
                    return {
                        requiresTwoFactorAuth: json.requiresTwoFactorAuth,
                    }
                }
                this.userData = json;
                return json;
            }

            this.isLogin = false;
            throw new LoginFailureException("Login failed: [" + response.status + " " + response.statusText + "] " + JSON.stringify(await response.json()));

        } catch (e) {
            throw e;
        }
    }

    public async TwoFactorAuth(OTPValue: string = "") {

        if (!this.isTwoFactorAuth) {
            this.logger.debug("No TwoFactorAuth required");
            return;
        }
        for (const otpType of this.otpType) {
            try {
                const token = this.TOTPHandler && otpType === "totp" ? this.TOTPHandler.generate() : OTPValue
                this.logger.debug("Try auth: " + otpType + " / " + token);
                const response = await fetch("https://api.vrchat.cloud/api/1/auth/twofactorauth/" + otpType + "/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": this.userAgent,
                        "Cookie": "apiKey=" + this.apiKey + "; auth=" + this.authCookie + "; twoFactorAuth=" + this.twoFactorAuth
                    },
                    body: JSON.stringify({
                        "code": token
                    })
                })

                if (response.status == 200) {
                    const twoFactorAuthMatch = response.headers.get("Set-Cookie")?.match(/twoFactorAuth=(.*?);/);
                    console.log(twoFactorAuthMatch);
                    // Cookieのセットがあったらそれを保存する
                    if (twoFactorAuthMatch) {
                        this.isLogin = true;
                        this.twoFactorAuth = twoFactorAuthMatch[1];
                        fs.writeFileSync(
                            path.join(this.secretFolder, "twoFactorAuth.txt"),
                            this.twoFactorAuth
                        );
                    }

                    // とはいえ受信内容の確認
                    const json = await response.json();
                    if (json && !json.requiresTwoFactorAuth) {
                        this.isLogin = true;
                        this.userData = json;
                        return {
                            userData: json,
                            isLogin: this.isLogin,
                        }
                    }
                }

                this.logger.warn("TwoFactorAuth failed: " + otpType + " / " + token);
            } catch (e) {
                this.logger.error("TwoFactorAuth failed: " + e);
            }
        }

        // ここまで来たら失敗
        this.isLogin = false;
        throw new LoginFailureException(`TwoFactorAuth failed for all types: ${this.otpType.join(", ")}`);
    
    }

    //#endregion Auth

    //#region User Management

    public async GetUserInfo(userId: string) {
        try {
            this.logger.debug("getting user info");
            const url = "https://api.vrchat.cloud/api/1/users/<userId>".replace("<userId>", userId);
            const response = await fetch(url, {
                method: "GET",
                headers: this.GetRequestHeader()
            });

            if (response.status === 200) {
                return response.json();
            }

            throw new Error("get failed: [" + response.status + " " + response.statusText + "] " + JSON.stringify(await response.json()));

        } catch (e) {
            throw e;
        }
    }

    //#endregion User Management

    //#region Group Management

    public async GetGroupMember(groupid: string, userId: string) {
        try {
            this.logger.debug("getting group member info");
            const url = "https://api.vrchat.cloud/api/1/groups/<groupId>/members/<userId>".replace("<groupId>", groupid).replace("<userId>", userId);
            
            const response = await fetch(url, {
                method: "GET",
                headers: this.GetRequestHeader()
            });

            if (response.status === 200) {
                return response.json();
            }

            throw new Error("get failed: [" + response.status + " " + response.statusText + "] " + JSON.stringify(await response.json()));

        } catch (e) {
            throw e;
        }
    }

    public async AddGroupRole(groupid: string, roleId: string, userId: string) {
        try {
            this.logger.debug("Adding group role to user");
            const url = "https://api.vrchat.cloud/api/1/groups/<groupId>/members/<userId>/roles/<roleId>".replace("<groupId>", groupid).replace("<userId>", userId).replace("<roleId>", roleId);
            const response = await fetch(url, {
                method: "PUT",
                headers: this.GetRequestHeader(),
            });

            if (response.status === 200) {
                this.logger.debug("AddGroupRole success.");
                return response.json();
            }

            throw new Error("set failed: [" + response.status + " " + response.statusText + "] " + JSON.stringify(await response.json()));

        } catch (e) {
            throw e;
        }
    }

    public async RemoveGroupRole(groupid: string, roleId: string, userId: string) {
        try {
            this.logger.debug("Removing group role from user");
            const url = "https://api.vrchat.cloud/api/1/groups/<groupId>/members/<userId>/roles/<roleId>".replace("<groupId>", groupid).replace("<userId>", userId).replace("<roleId>", roleId);

            const response = await fetch(url, {
                method: "DELETE",
                headers: this.GetRequestHeader(),
            });

            if (response.status === 200) {
                this.logger.debug("RemoveGroupRole success.");
                return response.json();
            }

            throw new Error("remove failed: [" + response.status + " " + response.statusText + "] " + JSON.stringify(await response.json()));
        } catch (e) {
            throw e;
        }
    }

    //#endregion Group Management

}