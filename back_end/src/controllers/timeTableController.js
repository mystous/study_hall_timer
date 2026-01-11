const timeTableService = require('../services/timeTableService');
const { addRequestLog } = require('../utils/utils');
const { User, ObserverRelation } = require('../database');

const getTimeTable = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // The middleware authMiddleware attaches user to req.user.

        const user = await User.findOne({ where: { username: req.user.username } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let userId = user.user_id;

        const requestedUserId = req.query.userId;
        if (requestedUserId && parseInt(requestedUserId) !== userId) {
            // Check permission
            const isGuardian = await ObserverRelation.findOne({
                where: {
                    student_id: requestedUserId,
                    guardian_id: userId,
                    status: 'accepted'
                }
            });

            if (!isGuardian) {
                return res.status(403).json({ success: false, message: 'Permission denied. Not an observer.' });
            }
            userId = requestedUserId;
        }

        const schedules = await timeTableService.getTimeTable(userId, startDate, endDate);

        if (!schedules || schedules.length === 0) {
            // Allow empty schedule return
        }

        addRequestLog(req, res, 'timetable', '', true);

        res.json({
            success: true,
            schedules: schedules
        });
    } catch (error) {
        addRequestLog(req, res, 'timetable', '', false, 'Error fetching timetable:' + error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred.'
        });
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
