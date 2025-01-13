const { Token, User, GroupInfo, StudySubjects, TimeTable, Categories } = require('./database');
const { testConnection } = require('./database');
const { Sequelize } = require('sequelize');

// 사용자의 토큰을 저장/업데이트하는 함수
async function saveUserTokens(username, accessToken, refreshToken) {
    try {
        await Token.update({
            access_token: accessToken,
            refresh_token: refreshToken
        }, {
            where: {
                username: username
            }
        });
    } catch (error) {
        console.error('Error saving user tokens:', error);
        throw error;
    }
}

// 사용자의 user_id를 조회하는 함수
async function getUser(username) {
    try {
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}


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

// 사용자의 salt 값을 조회하는 함수
async function getUserPasswordHash(username) {
    try {
        const user = await User.findOne({
            attributes: ['password_hash'],
            where: {
                username: username
            }
        });
        return user ? user.password_hash : null;
    } catch (error) {
        console.error('Error fetching user salt:', error);
        throw error;
    }
}

// 사용자의 그룹 정보를 조회하는 함수
async function getUserGroups(username) {
    try {
        const groups = await GroupInfo.findAll({
            include: [{
                model: User,
                where: { username: username },
                attributes: []
            }],
            attributes: ['group_id', 'group_name']
        });
        return groups;
    } catch (error) {
        console.error('Error fetching user groups:', error);
        throw error;
    }
}

// 그룹 멤버 조회
async function getGroupMembers(groupId) {
    try {
        const members = await User.findAll({ where: { group_id: groupId } });
        return members;
    } catch (error) {
        console.error('Error fetching group members:', error);
        throw error;
    }
}

// 그룹 조회
async function getGroups() {
    try {
        const groups = await GroupInfo.findAll();
        return groups;
    } catch (error) {
        console.error('Error fetching groups:', error);
        throw error;
    }
}

// 사용자 조회
async function getUsers() {
    try {
        const users = await User.findAll();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

async function getSubjects(user_id) {
    try {
        const subjects = await StudySubjects.findAll({
            where: { user_id: user_id },
            attributes: ['subject_id', 'subjectname', 'unit_time', 'color', 'visibility_level_id']
        });
        return subjects;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
}

async function getTimeTableByDateRange(userId, startDate, endDate) {
    try {
        const startcondition = startDate.split('T')[0] + ' 00:00:00';
        const endcondition = endDate.split('T')[0] + ' 23:59:59';

        const schedules = await TimeTable.findAll({
            where: {
                user_id: userId,
                start_time: {
                    [Sequelize.Op.between]: [startcondition, endcondition]
                }
            },
            attributes: ['schedule_id', 'subject_id', 'scheduled_time', 'start_time', 'dimmed'],
            include: [{
                model: StudySubjects,
                attributes: ['subject_id', 'subjectname', 'color', 'category_id'],
                required: true,
                include: [{
                    model: Categories,
                    attributes: ['category_name'],
                    required: true
                }]
            }],
            order: [['start_time', 'ASC']]
        });
        return schedules;
    } catch (error) {
        console.error('Error fetching time table:', error);
        throw error;
    }
}


async function testConn() {
   testConnection();
}

module.exports = {
    saveUserTokens, getUserSalt, getUserPasswordHash, getUserGroups, 
    getGroupMembers, getGroups, getUsers, getUser, getSubjects, 
    getTimeTableByDateRange, 
    testConn
};