const cartDetailService = require('../services/cartDetail.service');

class cartDetailController {
    async create(req, res) {
        try {
            const cartDetail = req.body;
            const newCartItem = await cartDetailService.create(cartDetail);
            res.status(201).json(newCartItem);
        } catch (error) {
            res.status(500).json({
                message: 'Error adding item to cart',
                error: error.message
            });
        }
    }

    async findByCartId(req, res) {
        try {
            const { cartId } = req.params;
            const cartItems = await cartDetailService.findByCartId(cartId);

            if (!cartItems) {
                return res.status(404).json({
                    message: 'Cart is empty or not found'
                });
            }
            res.status(200).json(cartItems);
        } catch (error) {
            res.status(500).json({
                message: 'Error retrieving cart items',
                error: error.message
            });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { cartId, productId, size, color } = req.params;
            const { quantity } = req.body;

            const updatedItem = await cartDetailService.updateQuantity(
                cartId, productId, size, color, quantity);

            if (!updatedItem) {
                return res.status(404).json({
                    message: 'Cart item not found'
                });
            }
            res.status(200).json(updatedItem);
        } catch (error) {
            res.status(500).json({
                message: 'Error updating cart item quantity',
                error: error.message
            });
        }
    }

    async removeFromCart(req, res) {
        try {
            const { cartId, productId, size, color } = req.params;
            const removedItem = await cartDetailService.removeFromCart(
                cartId,
                productId,
                size,
                color
            );

            if (!removedItem) {
                return res.status(404).json({
                    message: 'Cart item not found'
                });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                message: 'Error removing item from cart',
                error: error.message
            });
        }
    }
    async getCartTotal(req, res) {
        try {
            const { cartId } = req.params;
            const total = await cartDetailService.getCartTotal(cartId);
            res.status(200).json({ total });
        } catch (error) {
            res.status(500).json({
                message: 'Error calculating cart total',
                error: error.messageS
            });
        }
    }
}

module.exports = new cartDetailController();
