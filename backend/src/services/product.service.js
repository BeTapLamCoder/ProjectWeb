const db = require('../config/db.config');
const productModel = require('../models/product.model')
const cloudinary = require('../config/cloudinary.config');

class productService {
    async create(product, fileBuffer) {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }).end(fileBuffer);
        });

        product.image_url = result.secure_url;

        return await productModel.create(product);
    }
    async findAll() {
        const products = await db.query(
            `SELECT product.*, category.category_name
            FROM ${productModel.tableName}
            JOIN category ON product.category_id = category.category_id`
        );
        if (products.length === 0)
            return null;
        return products.rows;
    }
    async findById(id) {
        const product = await productModel.findById(id);
        if (!product)
            return null;
        return product;
    }
    async findByKeyword(keyword) {
        const products = await db.query(
            `SELECT product.*, category.category_name 
            FROM ${productModel.tableName}
            JOIN category ON product.category_id = category.category_id
            WHERE product.product_name ILIKE $1 
            OR product.description ILIKE $1 
            OR category.category_name ILIKE $1`,
            [`%${keyword}%`]
        );
        
        if (products.rows.length === 0)
            return null;
        return products.rows;
    }
    async update(id, product) {
        const updatedProduct = await productModel.update(id, product);
        if (!updatedProduct)
            return null;
        return updatedProduct;
    }
    async delete(id) {
        const deletedProduct = await productModel.delete(id);
        if (!deletedProduct)
            return null;
        return deletedProduct;
    }
}

module.exports = new productService();