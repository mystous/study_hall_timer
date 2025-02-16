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

// VisibilityLevel 모델 정의
const VisibilityLevel = sequelize.define('visibility_level', {
    visibility_level_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    description: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'visibility_levels',
    timestamps: false
});


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

// StudySubject 모델 정의
const StudySubjects = sequelize.define('study_subjects', {
    subject_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    subjectname: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    unit_time: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    color: {
        type: Sequelize.CHAR(7),
        allowNull: false
    },
    visibility_level_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }, 
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'study_subjects',
    timestamps: false//,
    //primaryKey: ['user_id', 'subject_id']
});

// TimeTable 모델 정의
const TimeTable = sequelize.define('time_table', {
    schedule_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    scheduled_time: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    start_time: {
        type: Sequelize.DATE,
        primaryKey: true,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    dimmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    special_text: {
        type: Sequelize.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'time_table',
    timestamps: false,
    charset: 'utf8mb4',
    engine: 'InnoDB'
});

// Categories 모델 정의
const Categories = sequelize.define('categories', {
    category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    category_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    }, 
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    color: {
        type: Sequelize.CHAR(7),
        allowNull: false
    }
}, {
    tableName: 'categories',
    timestamps: false,
    charset: 'utf8mb4',
    engine: 'InnoDB'
});

// 관계 설정
TimeTable.belongsTo(StudySubjects, {
    foreignKey: 'subject_id'
});

TimeTable.belongsTo(User, {
    foreignKey: 'user_id'
});

StudySubjects.hasMany(TimeTable, {
    foreignKey: 'subject_id'
});

TimeTable.belongsTo(StudySubjects, {
    foreignKey: 'subject_id'
});

Categories.hasMany(StudySubjects, {
    foreignKey: 'category_id'
});

StudySubjects.belongsTo(Categories, {
    foreignKey: 'category_id'
});

StudySubjects.belongsTo(User, {
    foreignKey: 'user_id'
});

StudySubjects.belongsTo(VisibilityLevel, {
    foreignKey: 'visibility_level_id'
});

User.belongsToMany(GroupInfo, {
    through: UserGroupInfo,
    foreignKey: 'user_id'
});

GroupInfo.belongsToMany(User, {
    through: UserGroupInfo,
    foreignKey: 'group_id'
});


module.exports = {
   Token, User, GroupInfo, UserGroupInfo, VisibilityLevel, StudySubjects, TimeTable, Categories,
   testConnection
};
