const { Token, User, GroupInfo } = require('./database');
const { testConnection } = require('./database');
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

async function testConn() {
   testConnection();
}

module.exports = {
    saveUserTokens,
    getUserSalt,
    getUserPasswordHash,
    getUserGroups,
    testConn
};