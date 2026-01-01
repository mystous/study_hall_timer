const jwt = require('jsonwebtoken');
const { logger, addRequestLog } = require('../utils/utils');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET is not set in production environment!');
}

const validateAuthHeaderWithUsername = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Logging might need adjustment if body.username is not present, but keeping consistent with original logic idea
        addRequestLog(req, res, 'auth', req.body.username || 'unknown', false, 'No token provided:' + authHeader);
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            addRequestLog(req, res, 'auth', req.body.username || 'unknown', false, 'Invalid or expired token:' + error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        addRequestLog(req, res, 'auth', req.body.username || 'unknown', false, 'Internal server error:' + error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during auth'
        });
    }
};

module.exports = {
    validateAuthHeader: validateAuthHeaderWithUsername,
    JWT_SECRET
};
