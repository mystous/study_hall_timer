const { User } = require('./src/database');

const listUsers = async () => {
    try {
        const users = await User.findAll();
        console.log('Users:', users.map(u => ({ id: u.user_id, username: u.username })));
    } catch (error) {
        console.error('Error:', error);
    }
};

listUsers();
