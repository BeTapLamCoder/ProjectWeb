const express = require('express');
const cartDetailController = require('../controllers/cartDetail.controller');

const router = express.Router();

router.post('/', cartDetailController.create);

router.get('/:cartId/total', cartDetailController.getCartTotal);

router.get('/:cartId', cartDetailController.findByCartId);

router.put('/:cartId/:productId/:size/:color', cartDetailController.updateQuantity);

router.delete('/:cartId/:productId/:size/:color', cartDetailController.removeFromCart);





module.exports = router;