const BaseModel = require('./base.model');

class UserModel extends BaseModel {
    constructor() {
        super('users', 'user_id');
    }
}

module.exports = new UserModel();