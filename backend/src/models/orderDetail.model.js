const BaseModel = require('./base.model');

class OrderDetailModel extends BaseModel {
    constructor() {
        super('order_detail', ['order_id', 'product_id', 'size', 'color']);
    }
}

module.exports = new OrderDetailModel();