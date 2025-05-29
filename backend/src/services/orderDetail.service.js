const db = require('../config/db.config');
const orderDetailModel = require('../models/orderDetail.model');

class OrderDetailService {
    // get all order details by order ID
    async findByOrderId(orderId) {
        const query = {
            text: `
            SELECT od.*, p.product_name, p.image_url
            FROM order_detail od
            JOIN product p ON od.product_id = p.product_id
            WHERE od.order_id = $1
            `,
            values: [orderId]
        };
        const result = await db.query(query);
        return result.rows;
    }
    //update quantity of a product in an order
    async updateQuantity(orderId, productId, size, color, quantity) {
        try {
            const query = {
                text: `
                UPDATE order_detail 
                SET quantity = $1 
                WHERE order_id = $2 
                AND product_id = $3 
                AND size = $4 
                AND color = $5
                RETURNING *
            `,
                values: [quantity, orderId, productId, size, color]
            };

            const result = await db.query(query);

            if (result.rows.length === 0) {
                throw new Error('Order detail not found');
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }


    async removeProduct(orderId, productId, size, color) {
        try {
            const query = {
                text: `
                DELETE FROM order_detail 
                WHERE order_id = $1 
                AND product_id = $2 
                AND size = $3 
                AND color = $4
                RETURNING *
            `,
                values: [orderId, productId, size, color]
            };

            const result = await db.query(query);

            if (result.rows.length === 0) {
                throw new Error('Order detail not found');
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }


    async addProduct(orderDetail) {
        // Check if product exists
        const productQuery = {
            text: 'SELECT price FROM product WHERE product_id = $1',
            values: [orderDetail.product_id]
        };
        const productResult = await db.query(productQuery);

        if (!productResult.rows.length) {
            throw new Error('Product not found');
        }

        // Set the current price of the product
        orderDetail.price = productResult.rows[0].price;

        return await orderDetailModel.create(orderDetail);
    }

    async calculateOrderTotal(orderId) {
        const query = {
            text: `
            SELECT SUM(quantity * price) as total
            FROM order_detail
            WHERE order_id = $1
            `,
            values: [orderId]
        };
        const result = await db.query(query);
        return result.rows[0]?.total || 0;
    }
}

module.exports = new OrderDetailService();