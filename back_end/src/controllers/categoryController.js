const { Categories, User, StudySubjects, ObserverRelation } = require('../database');
const { addRequestLog } = require('../utils/utils');
const db = require('../db_operation');

const getCategories = async (req, res) => {
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

        const categories = await db.getCategories(userId); // Assuming db_operation has getCategories
        addRequestLog(req, res, 'categories', '', true);
        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        addRequestLog(req, res, 'categories', '', false, error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getCategories = getCategories;

exports.createCategory = async (req, res) => {
    try {
        const { category_name, color } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newCategory = await Categories.create({
            user_id: user.user_id,
            category_name,
            color
        });

        addRequestLog(req, res, 'create_category', req.user.username, true);
        res.json({ success: true, category: newCategory });
    } catch (error) {
        addRequestLog(req, res, 'create_category', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, color } = req.body;
        const user = await User.findOne({ where: { username: req.user.username } });

        const category = await Categories.findOne({ where: { category_id: id, user_id: user.user_id } });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category.category_name = category_name;
        category.color = color;
        await category.save();

        addRequestLog(req, res, 'update_category', req.user.username, true);
        res.json({ success: true, category });
    } catch (error) {
        addRequestLog(req, res, 'update_category', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { username: req.user.username } });

        // Check if category belongs to user
        const category = await Categories.findOne({ where: { category_id: id, user_id: user.user_id } });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Check if subjects exist for this category
        const subjectCount = await StudySubjects.count({ where: { category_id: id } });
        if (subjectCount > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete category with associated subjects' });
        }

        await category.destroy();
        addRequestLog(req, res, 'delete_category', req.user.username, true);
        res.json({ success: true });
    } catch (error) {
        addRequestLog(req, res, 'delete_category', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
