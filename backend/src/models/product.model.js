const BaseModel = require('./base.model');

class ProductModel extends BaseModel {
    constructor() {
        super('product', 'product_id');
    }
}

module.exports = new ProductModel();