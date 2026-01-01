const { User, GroupInfo, UserGroupInfo, StudySubjects, Categories } = require('../database');

const getUserGroups = async (username) => {
    const user = await User.findOne({
        where: { username },
        include: [{
            model: GroupInfo,
            through: { attributes: [] } // hide join table attributes if not needed
        }]
    });
    if (!user) return [];

    return user.group_infos; // Sequelize populates this property based on association alias or model name
};

const getUsers = async () => {
    return await User.findAll({ attributes: ['username', 'user_id'] }); // Security: don't return passwords
};

const getGroups = async () => {
    return await GroupInfo.findAll();
};

const getGroupMembers = async (groupId) => {
    const group = await GroupInfo.findByPk(groupId);
    if (!group) return [];
    return await group.getUsers({ attributes: ['username'] });
};

module.exports = {
    getUserGroups,
    getUsers,
    getGroups,
    getGroupMembers
};
