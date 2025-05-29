const UserService = require('../services/user.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'h8G4$k9zP!rTq2WxLm#Z7fVsN3yEj@dY'

class UserController {
    async findAllUsers(req, res) {
        try {
            const users = await UserService.findAll();
            if (!users) {
                return res.status(404).json({ message: 'No users found' });
            }
            return res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    //Register
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Name, email, and password are required' });
            }

            const user = await UserService.findByEmail(email);
            if (user) {
                return res.status(409).json({ message: 'Email already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await UserService.create({
                name,
                email,
                password: hashedPassword,
                role: 'customer'
            });

            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ message: 'Internal server error: ' + error.message });
        }
    }
    //Login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await UserService.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            const payload = {
                id: user.user_id,
                email: user.email,
                role: user.role,
                phone_number: user.phone_number || null,
            }

            const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '2m' });
            const refreshToken = jwt.sign({
                ...payload,
                token_type: 'refresh_token'
            },
                SECRET_KEY, { expiresIn: '7d' });
            return res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ message: 'Internal server error' + ' ' + error.message });
        }
    }

    async renewToken(req, res) {
        const refreshToken = req.headers['authorization'];

        if (!refreshToken) {
            res.status(401).json({
                message: 'Refresh token is missing',
                success: false,
            });
            return;
        }

        const token = refreshToken.split(' ')[1];

        try {

            const decoded = jwt.verify(token, SECRET_KEY);

            if (decoded.token_type != 'refresh_token') {
                res.status(403).json({
                    message: 'Invalid token type. Refresh token required.',
                    success: false,
                })
                return;
            }

            const user = await UserService.findByEmail(decoded.email);
            if (!user) {
                return res.status(404).json({ message: 'User not found', success: false });
            }

            const newAccessToken = jwt.sign(
                {
                    id: user.user_id,
                    email: user.email,
                    role: user.role,
                    phone_number: user.phone_number || null,
                },
                SECRET_KEY,
                { expiresIn: '2m' }
            );

            const newRefreshToken = jwt.sign(
                {
                    id: user.user_id,
                    email: user.email,
                    role: user.role,
                    phone_number: user.phone_number || null,
                    token_type: 'refresh_token'
                },
                SECRET_KEY,
                { expiresIn: '7d' }
            )

            res.status(200).json({
                message: 'Token refreshed successfully',
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                success: true
            });
            return;
        } catch (error) {
            res.status(401).json({
                message: 'Invalid or expired refresh token: ' + error.message,
                success: false,
            });
            return;
        }
    }
}

module.exports = new UserController();