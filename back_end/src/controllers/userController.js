const userService = require('../services/userService');
const { addRequestLog } = require('../utils/utils');

const getUserGroups = async (req, res) => {
    try {
        const username = req.user.username; // From authMiddleware
        const groups = await userService.getUserGroups(username);

        // Match original response format expected by frontend
        // frontend/src/common/AuthContext.js line 46: const groupData = await groupResponse.json();
        // Login.js expects data.groups.
        // AuthContext.js returns groupData.
        // So expected JSON is { groups: [...] } or { success: true, groups: [...] }?
        // Server.js original: res.json({ success: true, groups: groups });

        addRequestLog(req, res, 'user_groups', username, true);
        res.json({
            success: true,
            groups: groups || []
        });

    } catch (error) {
        addRequestLog(req, res, 'user_groups', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getUserGroups
};
