const db = require('../config/db.config');
const orderModel = require('../models/order.model');

class OrderService {
    async create(orderData) {
        try {
            // Validate required fields
            if (!orderData.user_id || !orderData.total_amount || !orderData.items?.length) {
                throw new Error('Missing required fields');
            }

            // Create the order using double quotes for table name
            const order = await db.query(
                `INSERT INTO "order" 
                (user_id, total_amount, status, shipping_address, receiver_name, receiver_phone)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    orderData.user_id,
                    orderData.total_amount,
                    'pending',
                    orderData.shipping_address,
                    orderData.receiver_name,
                    orderData.receiver_phone
                ]
            );

            // Insert order details
            for (const item of orderData.items) {
                await db.query(
                    `INSERT INTO order_detail 
                    (order_id, product_id, quantity, price, color, size)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        order.rows[0].order_id,
                        item.product_id,
                        item.quantity,
                        item.price,
                        item.color,
                        item.size
                    ]
                );
            }

            // Return complete order with items
            return await this.findById(order.rows[0].order_id);
        } catch (error) {
            throw error;
        }
    }

    //getall orders of a user
    async findByUserId(userId) {
        const query = {
            text: `
            SELECT o.*, 
                   json_agg(json_build_object(
                       'product_id', od.product_id,
                       'quantity', od.quantity,
                       'price', od.price,
                       'color', od.color,
                       'size', od.size
                   )) as items
            FROM "order" o
            LEFT JOIN order_detail od ON o.order_id = od.order_id
            WHERE o.user_id = $1
            GROUP BY o.order_id
            ORDER BY o.order_date DESC`,
            values: [userId]
        };
        const result = await db.query(query);
        return result.rows;
    }
    //get order by id
    async findById(orderId) {
        const query = {
            text: `
            SELECT o.*, 
                   json_agg(json_build_object(
                       'product_id', od.product_id,
                       'quantity', od.quantity,
                       'price', od.price,
                       'color', od.color,
                       'size', od.size
                   )) as items
            FROM "order" o
            LEFT JOIN order_detail od ON o.order_id = od.order_id
            WHERE o.order_id = $1
            GROUP BY o.order_id`,
            values: [orderId]
        };
        const result = await db.query(query);
        return result.rows[0];
    }

    async updateStatus(orderId, status) {
        try {
            // Validate status values
            const query = {
                text: `UPDATE "order" 
                   SET status = $1 
                   WHERE order_id = $2 
                   RETURNING *`,
                values: [status, orderId]
            };

            const result = await db.query(query);

            if (result.rows.length === 0) {
                throw new Error('Order not found');
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }


    async deleteOrder(orderId) {
        try {
            // delete all order details
            await db.query(
                `DELETE FROM order_detail WHERE order_id = $1`,
                [orderId]
            );

            //delete the order
            const result = await db.query(
                `DELETE FROM "order" WHERE order_id = $1 RETURNING *`,
                [orderId]
            );

            if (result.rows.length === 0) {
                throw new Error('Order not found');
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OrderService();