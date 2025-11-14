import e = require("express");
import { CreateTicketBatchData, ProductRepositoryInterface } from "../interfaces/ProductRepositoryInterface";
import { MySQLBaseRepository } from "./MySQLBaseRepository";
import uuid from "ui7";
import { Product } from "../../bean/product";
import { Ticket } from "../../bean/ticket";

export class MySQLProductRepository extends MySQLBaseRepository implements ProductRepositoryInterface {

    async getAllProducts(): Promise<Product[]> {
        try {
            const res = await this.connection.execute(
                `SELECT * FROM products`
            );
            if (!res || res.length === 0) {
                return [];
            }
            if (res[0].length === 0) {
                return [];
            }
            const products: Product[] = res[0].map((row: any) => {
                return new Product(
                    row.productId,
                    row.name,
                    row.createdAt,
                    row.updatedAt,
                    row.allowPlanIds ? JSON.parse(row.allowPlanIds) : []
                );
            });
            return products;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(productId: string): Promise<Product | null> {
        try {
            const res = await this.connection.execute(
                `SELECT * FROM products WHERE productId = ?`,
                [productId]
            );
            if (!res || res.length === 0) {
                return null;
            }
            if (res[0].length === 0) {
                return null;
            }
            const row = res[0][0];
            return new Product(
                row.productId,
                row.name,
                row.createdAt,
                row.updatedAt,
                row.allowPlanIds ? JSON.parse(row.allowPlanIds) : []
            );
        } catch (error) {
            throw error;
        }
    }

    async getLatestTicketId(productId: string): Promise<number | null> {
        try {
            const res = await this.connection.execute(
                `SELECT MIN(ticketId) AS nextTicketId FROM tickets WHERE productId = ? AND assignedUserId IS NULL`,
                [productId]
            );
            if (!res || res.length === 0) {
                return null;
            }
            if (res[0].length === 0) {
                return null;
            }
            return res[0][0].nextTicketId;
        } catch (error) {
            throw error;
        }
    }

    async assignTicketUser(productId: string, ticketId: string, userId: string): Promise<Ticket> {
        try {

            await this.connection.execute(
                `UPDATE tickets SET assignedUserId = ?, assignedAt = ? WHERE productId = ? AND ticketId = ?`,
                [userId, new Date(), productId, ticketId]
            );

            return await this.getAssignedTicketUser(productId, userId) as Ticket;

        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getAssignedTicketUser(productId: string, userId: string): Promise<Ticket | null> {
        try {
            const res = await this.connection.execute(
                `SELECT * FROM tickets WHERE productId = ? AND assignedUserId = ?`,
                [productId, userId]
            );
            if (!res || res.length === 0) {
                return null;
            }
            if (res[0].length === 0) {
                return null;
            }
            const row = res[0][0];
            return new Ticket(
                row.productId,
                row.ticketId,
                row.assignedUserId,
                row.content,
                row.url,
                row.comment,
                row.createdAt,
                row.assignedAt
            );

        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

}