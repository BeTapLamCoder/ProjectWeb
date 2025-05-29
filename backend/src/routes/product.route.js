const express = require('express');
const productController = require('../controllers/product.controller');
const multer = require('multer');
const upload = multer();
const router = express.Router();

router.post('/', upload.single('image') , productController.create);
router.get('/', productController.find);
router.get('/:id', productController.findById);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

module.exports = router;