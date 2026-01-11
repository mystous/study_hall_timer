const authService = require('../services/authService');
const { addRequestLog } = require('../utils/utils');
const { ObserverRelation } = require('../database');

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            throw new Error('Username and password are required.');
        }

        await authService.register(username, password);

        addRequestLog(req, res, 'register', username, true);

        res.json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        addRequestLog(req, res, 'register', username, false, 'Register error:' + error.message);

        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await authService.login(username, password);

        const pendingCount = await ObserverRelation.count({
            where: {
                student_id: result.user.user_id,
                status: 'pending'
            }
        });

        // Check for new acceptances (where user is GUARDIAN)
        const acceptanceCount = await ObserverRelation.count({
            where: {
                guardian_id: result.user.user_id,
                status: 'accepted',
                is_checked: false
            }
        });

        addRequestLog(req, res, 'login', username, true);

        res.json({
            success: true,
            message: 'Login successful',
            token: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            },
            user: {
                username: result.user.username
            },
            hasPendingObserverRequests: pendingCount > 0,
            hasNewAcceptanceNotifications: acceptanceCount > 0
        });
    } catch (error) {
        addRequestLog(req, res, 'login', username, false, 'Login error:' + error.message);

        const status = error.message === 'Cannot find user.' || error.message === 'Password does not match.' ? 401 : 500;

        res.status(status).json({
            success: false,
            message: error.message || 'Server error occurred.'
        });
    }
}

const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const result = await authService.refreshToken(refreshToken);

        addRequestLog(req, res, 'refresh', '', true);

        res.json({
            success: true,
            accessToken: result.accessToken
        });
    } catch (error) {
        addRequestLog(req, res, 'refresh', '', false, 'Refresh error:' + error.message);
        res.status(401).json({
            success: false,
            message: error.message || 'Invalid refresh token.'
        });
    }
};

module.exports = {
    login,
    register,
    refresh
};
