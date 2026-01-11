const { User, Token } = require('../database');
const passwordManager = require('../authorization');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET is not set in production environment!');
}

const login = async (username, password) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
        throw new Error('Cannot find user.');
    }

    const isValid = await passwordManager.verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
        throw new Error('Password does not match.');
    }

    const accessToken = jwt.sign(
        { username: username, user_id: user.user_id },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { username: username, user_id: user.user_id },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Save tokens
    // Check if token entry exists
    const tokenEntry = await Token.findOne({ where: { username } });
    if (tokenEntry) {
        await Token.update({ access_token: accessToken, refresh_token: refreshToken }, { where: { username } });
    } else {
        await Token.create({ username, access_token: accessToken, refresh_token: refreshToken });
    }

    return { accessToken, refreshToken, user };
};

const refreshToken = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        const tokenEntry = await Token.findOne({ where: { username, refresh_token: token } });
        if (!tokenEntry) {
            throw new Error('Invalid refresh token.');
        }

        // Fetch user to get user_id
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error('User not found.');
        }

        const accessToken = jwt.sign(
            { username: username, user_id: user.user_id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        await Token.update({ access_token: accessToken }, { where: { username } });

        return { accessToken };
    } catch (error) {
        throw new Error('Invalid or expired refresh token.');
    }
};

const getUser = async (username) => {
    return await User.findOne({ where: { username } });
};

module.exports = {
    login,
    refreshToken,
    getUser
};
