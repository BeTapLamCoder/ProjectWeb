const BaseModel = require('./base.model');

class OrderModel extends BaseModel {
    constructor() {
        super('order', 'order_id');
    }
}

module.exports = new OrderModel();