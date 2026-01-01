const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const timeTableController = require('../controllers/timeTableController');
const userController = require('../controllers/userController');
// const subjectController = require('../controllers/subjectController'); (Not implemented yet, but placeholders)

const { validateAuthHeader } = require('../middlewares/authMiddleware');
const { validateLogin } = require('../middlewares/validationMiddleware');

// Public Routes
router.post('/login', validateLogin, authController.login);

// Protected Routes - User
router.get('/user/user_groups', validateAuthHeader, userController.getUserGroups);

// Protected Routes - Admin
router.post('/admin/users', validateAuthHeader, adminController.getUsers);
router.post('/admin/groups', validateAuthHeader, adminController.getGroups);
router.post('/admin/groups/:groupId/members', validateAuthHeader, adminController.getGroupMembers);

// Protected Routes - TimeTable
router.get('/time_table', validateAuthHeader, timeTableController.getTimeTable);
router.post('/time_table', validateAuthHeader, timeTableController.addSchedule);
router.put('/time_table', validateAuthHeader, timeTableController.updateSchedule);
router.delete('/time_table', validateAuthHeader, timeTableController.deleteSchedule);

// Protected Routes - Subjects (Legacy wrappers or need specific controller?)
// app.get('/api/v1/subjects') -> subjectController.getSubjects
// app.post('/api/v1/subjects') -> subjectController.createSubject

const { User, StudySubjects, Categories } = require('../database');
const { addRequestLog } = require('../utils/utils');

// Quick Subject Controller Implementation Inline or Move later
router.get('/subjects', validateAuthHeader, async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.user.username } });
        const subjects = await StudySubjects.findAll({
            where: { user_id: user.user_id },
            include: [Categories]
        });
        addRequestLog(req, res, 'subjects', req.user.username, true);
        res.json({ success: true, subjects });
    } catch (error) {
        addRequestLog(req, res, 'subjects', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/subjects', validateAuthHeader, async (req, res) => {
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
        res.json({ success: true, subject_id: newSubject.subject_id });
    } catch (error) {
        addRequestLog(req, res, 'create_subject', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/categories', validateAuthHeader, async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.user.username } });
        const categories = await Categories.findAll({ where: { user_id: user.user_id } });
        addRequestLog(req, res, 'get_categories', req.user.username, true);
        res.json({ success: true, categories });
    } catch (error) {
        addRequestLog(req, res, 'get_categories', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Test
router.get('/test', (req, res) => {
    const currentTime = new Date().toLocaleString('ko-KR');
    res.json({ timestamp: currentTime });
});

module.exports = router;
