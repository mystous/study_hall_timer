require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// 데이터베이스 연결 테스트 함수
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        throw err;
    }
}

// User 모델 정의
const User = sequelize.define('user_info', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    salt: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'user_info',
    timestamps: false
});

// 사용자의 salt 값을 조회하는 함수
async function getUserSalt(username) {
    try {
        const user = await User.findOne({
            attributes: ['salt'],
            where: {
                username: username
            }
        });
        return user ? user.salt : null;
    } catch (error) {
        console.error('Error fetching user salt:', error);
        throw error;
    }
}

module.exports = {
    sequelize,
    testConnection,
    getUserSalt
};