const userService = require('../services/userService');
const { addRequestLog } = require('../utils/utils');

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        addRequestLog(req, res, 'get_users', req.user.username, true);
        res.json({ success: true, users });
    } catch (error) {
        addRequestLog(req, res, 'get_users', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getGroups = async (req, res) => {
    try {
        const groups = await userService.getGroups();
        if (!groups || groups.length === 0) {
            addRequestLog(req, res, 'get_groups', req.user.username, false, 'No groups found');
            return res.status(404).json({ success: false, message: 'No groups found' });
        }
        addRequestLog(req, res, 'get_groups', req.user.username, true);
        res.json({ success: true, groups });
    } catch (error) {
        addRequestLog(req, res, 'get_groups', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const members = await userService.getGroupMembers(groupId);
        addRequestLog(req, res, 'get_group_members', req.user.username, true);
        res.json({ success: true, members });
    } catch (error) {
        addRequestLog(req, res, 'get_group_members', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getGroups,
    getGroupMembers
};
