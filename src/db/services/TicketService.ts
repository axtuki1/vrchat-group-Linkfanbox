import { Product } from "../../bean/product";
import { Ticket } from "../../bean/ticket";
import { ProductRepositoryInterface } from "../interfaces/ProductRepositoryInterface";

export class TicketService {
    constructor(private productRepository: ProductRepositoryInterface) {}

    async getAllProducts(): Promise<Product[]> {
        try {
            const products = await this.productRepository.getAllProducts();
            if (!products) {
                return null;
            }
            return products;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    async getProductById(productId: string): Promise<Product | null> {
        try {
            const product = await this.productRepository.getProductById(productId);
            return product;
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            throw error;
        }
    }


    async assignTicketToUser(productId: string, userId: string): Promise<Ticket> {
        try {
            const nextTicketId = await this.productRepository.getLatestTicketId(productId);
            if (nextTicketId === null) {
                throw new Error('No available tickets for this product.');
            }
            return await this.productRepository.assignTicketUser(productId, nextTicketId.toString(), userId);
        } catch (error) {
            console.error('Error assigning ticket to user:', error);
            throw error;
        }
    }

    async getAssignedTicketUser(productId: string, userId: string): Promise<Ticket | null> {
        try {
            return await this.productRepository.getAssignedTicketUser(productId, userId);
        } catch (error) {
            console.error('Error fetching assigned ticket for user:', error);
            throw error;
        }
    }


}