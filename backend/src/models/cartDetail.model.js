const BaseModel = require('./base.model');

class CartDetailModel extends BaseModel {
    constructor() {
        super('cart_detail', ['cart_id', 'product_id', 'size', 'color']);
    }
}
module.exports = new CartDetailModel();
