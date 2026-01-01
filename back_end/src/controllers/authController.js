const authService = require('../services/authService');
const { addRequestLog } = require('../utils/utils');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await authService.login(username, password);

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
            }
        });
    } catch (error) {
        addRequestLog(req, res, 'login', username, false, 'Login error:' + error.message);

        const status = error.message === 'Cannot find user.' || error.message === 'Password does not match.' ? 401 : 500;

        res.status(status).json({
            success: false,
            message: error.message || 'Server error occurred.'
        });
    }
};

module.exports = {
    login
};
