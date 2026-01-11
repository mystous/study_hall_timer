const { Categories, User, StudySubjects } = require('../database');
const { addRequestLog } = require('../utils/utils');

exports.getCategories = async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.user.username } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const categories = await Categories.findAll({ where: { user_id: user.user_id } });
        addRequestLog(req, res, 'get_categories', req.user.username, true);
        res.json({ success: true, categories });
    } catch (error) {
        addRequestLog(req, res, 'get_categories', req.user.username, false, error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

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
