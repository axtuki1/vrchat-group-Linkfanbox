import { User } from "../../bean/User";


export interface DiscordUserRepositoryInterface {
    registerDiscordUser(
        discordUserId: string,
        discordUsername: string,
        vrchatUserId: string | null,
        vrchatDisplayName: string | null,
    ): Promise<any>;
    updateDiscordUserByDiscordUserId(
        discordUserId: string,
        data: {
            discordUsername?: string;
            vrchatUserId: string | null;
        }
    ): Promise<any>;
    updateDiscordUser(
        userId: string,
        data: {
            discordUserId?: string;
            vrchatUserId?: string | null;
        }
    ): Promise<any>;
    getDiscordUserByDiscordId(discordUserId: string): Promise<any>;
    getDiscordUserByVrchatId(vrchatUserId: string): Promise<any>;
    getDiscordUserById(id: string): Promise<any>;
    getRegisteredDiscordUsers(limit: number, offset: number): Promise<any>;
    
}