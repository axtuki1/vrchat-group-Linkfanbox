import { Product } from "../../bean/product";
import { Ticket } from "../../bean/ticket";
import { User } from "../../bean/User";

export type CreateTicketBatchData = {
    productId: string;
    content: string;
    url?: string;
    comment?: string;
};

export interface ProductRepositoryInterface {
    
    /**
     * 商品をすべて取得します。
     */
    getAllProducts(): Promise<Product[]>;

    /**
     * 商品をIDで取得します。
     * @param productId
     */
    getProductById(productId: string): Promise<Product | null>;

    /**
     * チケットをユーザーに割り当てます。
     * @param productId 
     * @param userId 
     */
    assignTicketUser(productId: string, ticketId: string, userId: string): Promise<Ticket>;

    /**
     * 指定された商品IDに対して、次に利用可能なチケットIDを取得します。
     */
    getLatestTicketId(productId: string): Promise<number | null>;

    /**
     * 割り当て済みのチケットを取得します。
     * @param productId 
     * @param userId 
     */
    getAssignedTicketUser(productId: string, userId: string): Promise<Ticket | null>;

}