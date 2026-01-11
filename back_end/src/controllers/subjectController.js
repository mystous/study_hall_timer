const { StudySubjects, User, Categories } = require('../database');
const { addRequestLog } = require('../utils/utils');

exports.getSubjects = async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.user.username } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const subjects = await StudySubjects.findAll({
            where: { user_id: user.user_id },
            include: [Categories]
        });
        addRequestLog(req, res, 'get_subjects', req.user.username, true);
        res.json({ success: true, subjects });
    } catch (error) {
        addRequestLog(req, res, 'get_subjects', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

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
