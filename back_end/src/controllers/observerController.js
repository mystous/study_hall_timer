const { ObserverRelation, User, StudySubjects, TimeTable, Categories } = require('../database');
const { Op } = require('sequelize');
const { addRequestLog } = require('../utils/utils');

const requestObservation = async (req, res) => {
    const { studentUsername } = req.body;
    const guardianId = req.user.user_id; // From authMiddleware

    try {
        const student = await User.findOne({ where: { username: studentUsername } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        if (student.user_id === guardianId) {
            return res.status(400).json({ success: false, message: 'You cannot observe yourself.' });
        }

        const existingRelation = await ObserverRelation.findOne({
            where: {
                student_id: student.user_id,
                guardian_id: guardianId
            }
        });

        if (existingRelation) {
            return res.status(400).json({ success: false, message: 'Request already exists or accepted.' });
        }

        await ObserverRelation.create({
            student_id: student.user_id,
            guardian_id: guardianId,
            status: 'pending'
        });

        addRequestLog(req, res, 'observer', '', true, 'Request sent to ' + studentUsername);
        res.json({ success: true, message: 'Request sent successfully.' });

    } catch (error) {
        addRequestLog(req, res, 'observer', '', false, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPendingRequests = async (req, res) => {
    const studentId = req.user.user_id;

    try {
        const requests = await ObserverRelation.findAll({
            where: {
                student_id: studentId,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'Guardian',
                attributes: ['user_id', 'username']
            }]
        });

        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMySentRequests = async (req, res) => {
    const guardianId = req.user.user_id;

    try {
        const requests = await ObserverRelation.findAll({
            where: {
                guardian_id: guardianId,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'Student',
                attributes: ['user_id', 'username']
            }]
        });

        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const respondObservation = async (req, res) => {
    const { relationId, action } = req.body; // action: 'accept' or 'reject'
    const studentId = req.user.user_id;

    try {
        const relation = await ObserverRelation.findOne({
            where: {
                relation_id: relationId,
                student_id: studentId
            }
        });

        if (!relation) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        if (action === 'accept') {
            relation.status = 'accepted';
            relation.is_checked = false; // Mark as new notification
            await relation.save();
            addRequestLog(req, res, 'observer', '', true, 'Accepted request ' + relationId);
            res.json({ success: true, message: 'Request accepted.' });
        } else if (action === 'reject') {
            await relation.destroy();
            addRequestLog(req, res, 'observer', '', true, 'Rejected request ' + relationId);
            res.json({ success: true, message: 'Request rejected.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid action.' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeObservation = async (req, res) => {
    const { relationId } = req.body; // or params
    const userId = req.user.user_id;

    try {
        const relation = await ObserverRelation.findByPk(relationId);
        if (!relation) {
            return res.status(404).json({ success: false, message: 'Relation not found.' });
        }

        if (relation.student_id !== userId && relation.guardian_id !== userId) {
            return res.status(403).json({ success: false, message: 'Permission denied.' });
        }

        await relation.destroy();
        addRequestLog(req, res, 'observer', '', true, 'Removed relation ' + relationId);
        res.json({ success: true, message: 'Relation removed.' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getObservedStudents = async (req, res) => {
    const guardianId = req.user.user_id;

    try {
        const relations = await ObserverRelation.findAll({
            where: {
                guardian_id: guardianId,
                status: 'accepted'
            },
            include: [{
                model: User,
                as: 'Student',
                attributes: ['user_id', 'username']
            }]
        });

        const students = relations.map(r => ({
            ...r.Student.toJSON(),
            relation_id: r.relation_id
        }));

        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyObservers = async (req, res) => {
    const studentId = req.user.user_id;

    try {
        const relations = await ObserverRelation.findAll({
            where: {
                student_id: studentId,
                status: 'accepted'
            },
            include: [{
                model: User,
                as: 'Guardian',
                attributes: ['user_id', 'username']
            }]
        });

        const observers = relations.map(r => ({
            ...r.Guardian.toJSON(),
            relation_id: r.relation_id
        }));

        res.json({ success: true, observers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNotifications = async (req, res) => {
    const guardianId = req.user.user_id;

    try {
        const relations = await ObserverRelation.findAll({
            where: {
                guardian_id: guardianId,
                status: 'accepted',
                is_checked: false
            },
            include: [{
                model: User,
                as: 'Student',
                attributes: ['user_id', 'username']
            }]
        });

        // Notifications to return
        const notifications = relations.map(r => ({
            type: 'accepted',
            student: r.Student.toJSON().username,
            relation_id: r.relation_id
        }));

        // Mark as checked
        if (relations.length > 0) {
            await ObserverRelation.update({ is_checked: true }, {
                where: {
                    relation_id: relations.map(r => r.relation_id)
                }
            });
        }

        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    requestObservation,
    getPendingRequests,
    respondObservation,
    removeObservation,
    getObservedStudents,
    getMyObservers,
    getMySentRequests,
    getNotifications
};
