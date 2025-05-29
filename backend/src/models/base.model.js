const db = require('../config/db.config');

class BaseModel {
    constructor(tableName, idColumn = 'id') {
        this.tableName = tableName;
        this.idColumn = idColumn;
    }
    async findAll() {
        const res = await db.query(`SELECT * FROM ${this.tableName}`);
        return res.rows;
    }

    async findById(id) {
        const res = await db.query(
            `SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = $1`,
            [id]
        );
        return res.rows[0];
    }

    async create(data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const params = columns.map((_, i) => `$${i + 1}`);

        const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${params.join(', ')}) RETURNING *`;
        const res = await db.query(sql, values);
        return res.rows[0];
    }

    async update(id, data) {
        const columns = Object.keys(data);
        const values = Object.values(data);

        const setStr = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setStr} WHERE ${this.idColumn} = $${columns.length + 1} RETURNING *`;
        const res = await db.query(sql, [...values, id]);
        return res.rows[0];
    }

    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = $1 RETURNING *`;
        const res = await db.query(sql, [id]);
        return res.rows[0];
    }
}

module.exports = BaseModel;