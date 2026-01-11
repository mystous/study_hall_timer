const { StudySubjects, User, Categories, ObserverRelation } = require('../database');
const { addRequestLog } = require('../utils/utils');
const db = require('../db_operation');

const getSubjects = async (req, res) => {
    let userId = req.user.user_id;
    const requestedUserId = req.query.userId;

    try {
        if (requestedUserId && parseInt(requestedUserId) !== userId) {
            const isGuardian = await ObserverRelation.findOne({
                where: {
                    student_id: requestedUserId,
                    guardian_id: userId,
                    status: 'accepted'
                }
            });
            if (!isGuardian) {
                return res.status(403).json({ success: false, message: 'Permission denied.' });
            }
            userId = requestedUserId;
        }

        const subjects = await db.getSubjects(userId);
        addRequestLog(req, res, 'subjects', '', true);
        res.json({
            success: true,
            subjects: subjects
        });
    } catch (error) {
        addRequestLog(req, res, 'subjects', '', false, error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getSubjects = getSubjects;

exports.createSubject = async (req, res) => {
    try {
        const { subject_name, category_id, subject_color, subject_unit_time } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });

        const newSubject = await StudySubjects.create({
            user_id: user.user_id,
            subjectname: subject_name,
            category_id: category_id,
            color: subject_color,
            unit_time: subject_unit_time,
            visibility_level_id: 1 // Default
        });

        addRequestLog(req, res, 'create_subject', req.user.username, true);
        res.json({ success: true, subject: newSubject });
    } catch (error) {
        addRequestLog(req, res, 'create_subject', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name, category_id, subject_color, subject_unit_time } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });

        const subject = await StudySubjects.findOne({ where: { subject_id: id, user_id: user.user_id } });
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        subject.subjectname = subject_name;
        subject.category_id = category_id;
        subject.color = subject_color;
        subject.unit_time = subject_unit_time;
        await subject.save();

        addRequestLog(req, res, 'update_subject', req.user.username, true);
        res.json({ success: true, subject });
    } catch (error) {
        addRequestLog(req, res, 'update_subject', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { username: req.user.username } });

        const subject = await StudySubjects.findOne({ where: { subject_id: id, user_id: user.user_id } });
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        await subject.destroy();
        addRequestLog(req, res, 'delete_subject', req.user.username, true);
        res.json({ success: true });
    } catch (error) {
        addRequestLog(req, res, 'delete_subject', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
