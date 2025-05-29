const productService = require('../services/product.service');

class ProductController {
    async create(req, res) {
        try {
            const product = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: 'Image file is required' });
            }

            const newProduct = await productService.create(product, file.buffer);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ message: 'Error creating product', error: error.message });
        }
    }

    async find(req, res) {
        try {
            const { keyword } = req.query;

            const products = keyword
                ? await productService.findByKeyword(keyword)
                : await productService.findAll();

            return !products || products.length === 0
                ? res.status(404).json({ message: keyword ? 'No products found matching the keyword' : 'No products found' })
                : res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({ message: keyword ? 'Error searching products' : 'Error retrieving products', error: error.message });
        }
    }

    async findById(req, res) {
        try {
            const product = await productService.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving product', error });
        }
    }

    async update(req, res) {
        try {
            const updatedProduct = await productService.update(req.params.id, req.body);
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(500).json({ message: 'Error updating product', error });
        }
    }

    async delete(req, res) {
        try {
            const deletedProduct = await productService.delete(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting product', error });
        }
    }
}
module.exports = new ProductController();