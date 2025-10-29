export class Product {
    public productId: string;
    public productName: string;
    public createdAt: Date;
    public updatedAt: Date;
    public allowPlanIds?: string[];

    constructor(
        productId: string,
        productName: string,
        createdAt: Date,
        updatedAt: Date,
        allowPlanIds?: string[]
    ) {
        this.productId = productId;
        this.productName = productName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.allowPlanIds = allowPlanIds;
    }
}