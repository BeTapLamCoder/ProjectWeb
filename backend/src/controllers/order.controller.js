const orderService = require('../services/order.service');

class OrderController {
    async create(req, res) {
        try {
            const orderData = req.body;
            const newOrder = await orderService.create(orderData);
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({
                message: 'Error creating order',
                error: error.message
            });
        }
    }

    async findByUserId(req, res) {
        try {
            const { userId } = req.params;
            const orders = await orderService.findByUserId(userId);

            if (!orders || orders.length === 0) {
                return res.status(404).json({
                    message: 'No orders found for this user'
                });
            }
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({
                message: 'Error retrieving orders',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const { orderId } = req.params;
            const order = await orderService.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({
                message: 'Error retrieving order',
                error: error.message
            });
        }
    }

    async updateStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const updatedOrder = await orderService.updateStatus(orderId, status);

            if (!updatedOrder) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({
                message: 'Error updating order status',
                error: error.message
            });
        }
    }

    async deleteOrder(req, res) {
        try {
            const { orderId } = req.params;
            const deletedOrder = await orderService.deleteOrder(orderId);

            if (!deletedOrder) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }

            res.status(200).json({
                message: 'Order deleted successfully',
                order: deletedOrder
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error deleting order',
                error: error.message
            });
        }
    }
}

module.exports = new OrderController();