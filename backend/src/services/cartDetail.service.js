const db = require('../config/db.config');
const cartDetailModel = require('../models/cartDetail.model');


class cartDetailService {
    async create(cartDetail) {
        const productQuery = {
            text: `
            SELECT image_url 
            FROM product 
            WHERE product_id = $1
            `,
            values: [cartDetail.product_id]
        };

        const productResult = await db.query(productQuery);
        if (!productResult.rows.length) {
            throw new Error('Product not found');
        }

        cartDetail.image_url = productResult.rows[0].image_url;

        return await cartDetailModel.create(cartDetail);
    }

    //Lấy tất cả item của môtj giỏ hàng
    async findByCartId(cartId) {
        const query = {
            text: `
            SELECT cd.*, p.product_name, p.price, p.image_url
            FROM cart_detail cd
            JOIN product p ON cd.product_id = p.product_id
            WHERE cd.cart_id = $1
            `,
            values: [cartId]
        };
        const result = await db.query(query)
        return result.rows.length > 0 ? result.rows : null;
    }

    //Cập nhật số lượng của một item trong giỏ 
    async updateQuantity(cartId, productId, size, color, quantity) {
        const updateQuantity = await db.query({
            text: ` UPDATE cart_detail
            SET quantity = $1
            WHERE cart_id = $2 AND product_id = $3 AND size = $4 AND color = $5
            RETURNING *
            `,
            values: [quantity, cartId, productId, size, color]
        });
        if (!updateQuantity.rows.length) {
            return null;
        }
        return updateQuantity.rows[0];

    }


    //Xoá một item trong giỏ hàng
    async removeFromCart(cartId, productId, size, color) {
        try {
            const result = await db.query(
                `DELETE FROM cart_detail 
                 WHERE cart_id = $1 
                 AND product_id = $2 
                 AND size = $3 
                 AND color = $4 
                 RETURNING *`,
                [cartId, productId, size, color]
            );

            if (result.rowCount === 0) {
                throw new Error('Cart item not found');
            }

            return result.rows[0];
        } catch (error) {
            throw new Error(`Failed to remove item from cart: ${error.message}`);
        }
    }


    //Tính tổng giá trị của giỏ hàng 
    async getCartTotal(cartId) {
        const query = {
            text: `
            SELECT SUM(p.price * cd.quantity) AS total
            FROM cart_detail cd
            JOIN product p ON cd.product_id = p.product_id
            WHERE cd.cart_id = $1
            `,
            values: [cartId]
        };
        const result = await db.query(query);
        return result.rows[0]?.total || 0;
    }
}
module.exports = new cartDetailService();