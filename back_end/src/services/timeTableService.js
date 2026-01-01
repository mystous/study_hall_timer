const { TimeTable, StudySubjects, User, Categories } = require('../database');
const { Op } = require('sequelize');

const getTimeTable = async (userId, startDate, endDate) => {
    // DB assumes logic similar to legacy `db.getTimeTableByDateRange`
    // Legacy: "dimmed" was check.

    // Convert dates if needed - Sequelize usually handles string dates well
    return await TimeTable.findAll({
        where: {
            user_id: userId,
            start_time: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [{
            model: StudySubjects,
            include: [Categories] // include category info
        }]
    });
};

const addSchedules = async (userId, schedules) => {
    // schedules is array of objects
    // Need to handle bulk create
    const newSchedules = schedules.map(s => ({
        user_id: userId,
        subject_id: s.subject_id,
        scheduled_time: s.scheduled_time,
        start_time: s.start_time,
        special_text: s.special_text,
        dimmed: false
    }));

    // Using start_time as PK might be tricky if not unique enough, but model said so.
    // Legacy db operation used `INSERT INTO ... ON DUPLICATE KEY UPDATE` logic?
    //server.js:392 await db.addTimeTableSchedules(userId, schedules);

    // We will iterate or use bulkCreate with updateOnDuplicate if MariahDB supports it via Sequelize
    return await TimeTable.bulkCreate(newSchedules, {
        updateOnDuplicate: ['scheduled_time', 'special_text', 'modified_at']
    });
};

const deleteSchedules = async (userId, schedules) => {
    // server.js:417 await db.deleteTimeTableSchedules
    // Expected schedules to be list of identifying info.
    // Usually deleting by IDs is safer.

    // If schedule_id is available (it is autoinc PK), use that.
    const ids = schedules.map(s => s.schedule_id).filter(id => id && id !== -1);
    if (ids.length > 0) {
        await TimeTable.destroy({
            where: {
                schedule_id: ids,
                user_id: userId
            }
        });
    }
};

const updateSchedules = async (userId, schedules) => {
    // server.js:439 await db.updateTimeTableSchedules
    // Iterative update
    for (const s of schedules) {
        if (s.schedule_id && s.schedule_id !== -1) {
            await TimeTable.update({
                scheduled_time: s.scheduled_time,
                start_time: s.start_time,
                special_text: s.special_text
            }, {
                where: {
                    schedule_id: s.schedule_id,
                    user_id: userId
                }
            });
        }
    }
};

module.exports = {
    getTimeTable,
    addSchedules,
    deleteSchedules,
    updateSchedules
};
