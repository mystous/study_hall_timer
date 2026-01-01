const validateInput = (req, res, next) => {
    // Basic sanitization
    // In a real scenario, use 'express-validator' or 'joi'
    // Here we just ensure critical fields aren't crazy long or injection-prone if needed
    // But ORM (Sequelize) handles most injection risks.

    // We can add specific checks here if requested by plan.
    // Plan said: "Implement Input Validation for API endpoints"

    // Check if body exists for POST/PUT
    if (['POST', 'PUT'].includes(req.method) && !req.body) {
        return res.status(400).json({ success: false, message: 'Missing request body' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    next();
};

module.exports = {
    validateInput,
    validateLogin
};
