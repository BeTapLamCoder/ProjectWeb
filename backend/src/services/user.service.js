const db = require('../config/db.config');
const userModel = require('../models/user.model');

class UserService {
    async create(user) {
        const newUser = await userModel.create(user);
        await db.query(
            `INSERT INTO cart (user_id) VALUES ($1)`,
            [newUser.user_id]
        );

        return newUser;
    }
    async findAll() {
        const users = await userModel.findAll();
        if (users.length === 0)
            return null;
        return users;
    }

    async findByEmail(email) {
        const res = await db.query(
            `SELECT users.*, cart.cart_id FROM ${userModel.tableName}
            LEFT JOIN cart ON users.user_id = cart.user_id
            WHERE TRIM(email) = $1`,
            [email]
        );

        if (res.rows.length === 0)
            return null;
        return res.rows[0];
    }

}
module.exports = new UserService();