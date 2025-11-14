export class Ticket {
    public productId: string;
    public ticketId: string;
    public assignedUserId?: string;
    public content: string;
    public url: string;
    public comment: string;
    public createdAt: Date;
    public assignedAt?: Date;

    constructor(
        productId: string,
        ticketId: string,
        assignedUserId: string,
        content: string,
        url: string,
        comment: string,
        createdAt: Date,
        assignedAt: Date,
    ) {
        this.productId = productId;
        this.ticketId = ticketId;
        this.assignedUserId = assignedUserId;
        this.content = content;
        this.url = url;
        this.comment = comment;
        this.createdAt = createdAt;
        this.assignedAt = assignedAt;
    }
}