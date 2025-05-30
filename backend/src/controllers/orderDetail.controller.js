const orderDetailService = require('../services/orderDetail.service');

class OrderDetailController {
    async findByOrderId(req, res) {
        try {
            const { orderId } = req.params;
            const orderDetails = await orderDetailService.findByOrderId(orderId);

            if (!orderDetails || orderDetails.length === 0) {
                return res.status(404).json({
                    message: 'No products found in this order'
                });
            }
            const response = {
                items: orderDetails,
                confirmed_at: orderDetails[0]?.confirmed_at || null,
                processing_at: orderDetails[0]?.processing_at || null,
                shipped_at: orderDetails[0]?.shipped_at || null,
                delivered_at: orderDetails[0]?.delivered_at || null
            };

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({
                message: 'Error retrieving order details',
                error: error.message
            });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { orderId, productId, size, color } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity < 1) {
                return res.status(400).json({
                    message: 'Invalid quantity'
                });
            }

            const updatedDetail = await orderDetailService.updateQuantity(
                orderId, productId, size, color, quantity
            );

            if (!updatedDetail) {
                return res.status(404).json({
                    message: 'Order detail not found'
                });
            }

            res.status(200).json(updatedDetail);
        } catch (error) {
            res.status(500).json({
                message: 'Error updating quantity',
                error: error.message
            });
        }
    }

    async removeProduct(req, res) {
        try {
            const { orderId, productId, size, color } = req.params;
            const removedDetail = await orderDetailService.removeProduct(
                orderId, productId, size, color
            );

            if (!removedDetail) {
                return res.status(404).json({
                    message: 'Order detail not found'
                });
            }

            res.status(200).json({
                message: 'Product removed from order successfully',
                detail: removedDetail
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error removing product from order',
                error: error.message
            });
        }
    }

    async addProduct(req, res) {
        try {
            const orderDetail = req.body;
            const newDetail = await orderDetailService.addProduct(orderDetail);
            res.status(201).json(newDetail);
        } catch (error) {
            res.status(500).json({
                message: 'Error adding product to order',
                error: error.message
            });
        }
    }
}

module.exports = new OrderDetailController();