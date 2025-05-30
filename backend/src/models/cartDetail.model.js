const db = require('../config/db.config');
const BaseModel = require('./base.model');

class CartDetailModel extends BaseModel {
    constructor() {
        super('cart_detail', ['cart_id', 'product_id', 'size', 'color']);
    }

    async delete(keys) {
        const conditions = Object.keys(keys);
        const values = Object.values(keys);

        const whereClause = conditions
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(' AND ');

        const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause} RETURNING *`;

        const res = await db.query(sql, values);
        return res.rows[0];
    }
}

module.exports = new CartDetailModel();
