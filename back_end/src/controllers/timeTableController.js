const timeTableService = require('../services/timeTableService');
const { addRequestLog } = require('../utils/utils');
const { User } = require('../database');

const getTimeTable = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // The middleware authMiddleware attaches user to req.user.
        // We need userId.
        // If JWT payload only has username, we might need to fetch userId or store it in token.
        // Current JWT payload: { username: ... }
        // Let's fetch User first.

        const user = await User.findOne({ where: { username: req.user.username } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const schedules = await timeTableService.getTimeTable(user.user_id, startDate, endDate);

        if (!schedules || schedules.length === 0) {
            addRequestLog(req, res, 'time_table', req.user.username, false, 'No time table found');
            return res.status(404).json({ success: false, message: 'No time table found' }); // Or empty list?
        }

        addRequestLog(req, res, 'time_table', req.user.username, true);
        res.json({ success: true, schedules });

    } catch (error) {
        addRequestLog(req, res, 'time_table', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addSchedule = async (req, res) => {
    try {
        const { schedules } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });

        await timeTableService.addSchedules(user.user_id, schedules);
        addRequestLog(req, res, 'add_time_table_schedule', req.user.username, true);

        res.json({ success: true, message: 'Time table schedule added successfully' });
    } catch (error) {
        addRequestLog(req, res, 'add_time_table_schedule', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const { schedules } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });

        await timeTableService.deleteSchedules(user.user_id, schedules);
        addRequestLog(req, res, 'delete_time_table_schedule', req.user.username, true);

        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        addRequestLog(req, res, 'delete_time_table_schedule', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const { schedules } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });

        await timeTableService.updateSchedules(user.user_id, schedules);
        addRequestLog(req, res, 'update_time_table_schedule', req.user.username, true);

        res.json({ success: true, message: 'Time table schedule updated successfully' });
    } catch (error) {
        addRequestLog(req, res, 'update_time_table_schedule', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getTimeTable,
    addSchedule,
    deleteSchedule,
    updateSchedule
};
