require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        logging: false
    }
);

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Fetch a user
        const users = await sequelize.query("SELECT * FROM user_info LIMIT 1", { type: sequelize.QueryTypes.SELECT });
        if (users.length === 0) {
            console.log('No users found.');
            return;
        }
        const user = users[0];
        console.log('Testing with user:', user.username, 'ID:', user.user_id);

        // 2. Fetch schedules for this user
        // Simulating the query logic roughly
        const schedules = await sequelize.query(`
            SELECT * FROM time_table 
            WHERE user_id = ${user.user_id}
            LIMIT 5
        `, { type: sequelize.QueryTypes.SELECT });

        console.log(`Found ${schedules.length} schedules for user ${user.user_id}`);
        console.log(schedules);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sequelize.close();
    }
};

run();
