const express = require('express');
const orderDetailController = require('../controllers/orderDetail.controller');

const router = express.Router();


router.get('/:orderId', orderDetailController.findByOrderId);

// Add new product to order
router.post('/', orderDetailController.addProduct);


router.put('/:orderId/:productId/:size/:color', orderDetailController.updateQuantity);


router.delete('/:orderId/:productId/:size/:color', orderDetailController.removeProduct);

module.exports = router;