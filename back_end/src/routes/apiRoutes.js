const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const timeTableController = require('../controllers/timeTableController');
const userController = require('../controllers/userController');
const subjectController = require('../controllers/subjectController');
const categoryController = require('../controllers/categoryController');

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


// Protected Routes - Subjects
router.get('/subjects', validateAuthHeader, subjectController.getSubjects);
router.post('/subjects', validateAuthHeader, subjectController.createSubject);
router.put('/subjects/:id', validateAuthHeader, subjectController.updateSubject);
router.delete('/subjects/:id', validateAuthHeader, subjectController.deleteSubject);

// Protected Routes - Categories
router.get('/categories', validateAuthHeader, categoryController.getCategories);
router.post('/categories', validateAuthHeader, categoryController.createCategory);
router.put('/categories/:id', validateAuthHeader, categoryController.updateCategory);
router.delete('/categories/:id', validateAuthHeader, categoryController.deleteCategory);

// Test
router.get('/test', (req, res) => {
    const currentTime = new Date().toLocaleString('ko-KR');
    res.json({ timestamp: currentTime });
});

module.exports = router;
