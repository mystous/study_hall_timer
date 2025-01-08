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
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    salt: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password_hash: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'user_info',
    timestamps: false
});
// GroupInfo 모델 정의
const GroupInfo = sequelize.define('group_info', {
    group_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    group_name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'group_info',
    timestamps: false
});

// UserGroupInfo 모델 정의 
const UserGroupInfo = sequelize.define('user_group_info', {
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'user_group_info',
    timestamps: false
});

// 관계 설정
User.belongsToMany(GroupInfo, { 
    through: UserGroupInfo,
    foreignKey: 'user_id'
});
GroupInfo.belongsToMany(User, {
    through: UserGroupInfo,
    foreignKey: 'group_id'  
});




// Token 모델 정의
const Token = sequelize.define('user_info', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    access_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    refresh_token: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    tableName: 'user_info',
    timestamps: false
});




module.exports = {
   Token, User, GroupInfo, UserGroupInfo,
   testConnection
};
