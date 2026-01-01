const { TimeTable, User, StudySubjects } = require('./src/database');

async function dumpDB() {
    try {
        console.log('--- USERS ---');
        const users = await User.findAll({ raw: true });
        console.table(users);

        console.log('\n--- TIMETABLES ---');
        const timetables = await TimeTable.findAll({
            raw: true,
            // limit: 20, // Limit to recent
            order: [['created_at', 'DESC']]
        });
        console.table(timetables);

    } catch (error) {
        console.error('Error dumping DB:', error);
    }
}

dumpDB();
