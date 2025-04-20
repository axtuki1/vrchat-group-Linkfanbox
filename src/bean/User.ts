export class User {
    public userId: string;
    public vrchatDisplayName: string;
    public vrchatUserId: string;
    public pixivUserId: string;
    public createdAt: Date;
    public updatedAt: Date;
    public fanboxPlanId: string;

    constructor(
        userId: string,
        vrchatDisplayName: string,
        vrchatUserId: string,
        pixivUserId: string,
        createdAt: Date,
        updatedAt: Date,
        fanboxPlanId: string
    ) {
        this.userId = userId;
        this.vrchatDisplayName = vrchatDisplayName;
        this.vrchatUserId = vrchatUserId;
        this.pixivUserId = pixivUserId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.fanboxPlanId = fanboxPlanId;
    }
}