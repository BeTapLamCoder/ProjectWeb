const express = require('express');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.post('/', orderController.create);
router.get('/user/:userId', orderController.findByUserId);
router.get('/:orderId', orderController.findById);
router.put('/:orderId/status', orderController.updateStatus);
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;