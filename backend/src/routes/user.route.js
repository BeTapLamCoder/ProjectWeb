const express = require('express');
const UserController = require('../controllers/user.controller');

const router = express.Router();

router.get('/', UserController.findAllUsers);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/refresh-token', UserController.renewToken);

module.exports = router;