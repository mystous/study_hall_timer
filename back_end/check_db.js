
require('dotenv').config();
const { StudySubjects, User, testConnection } = require("./src/database");

(async () => {
    try {
        await testConnection();
        console.log("DB Connected");
        const user = await User.findOne({ where: { username: "bears_chj7" } });
        if (user) {
            console.log("User found:", user.username, user.user_id);
            const subjects = await StudySubjects.findAll({ where: { user_id: user.user_id } });
            console.log("Subject Count:", subjects.length);
            console.log("Subjects:", subjects.map(s => s.subjectname));
        } else {
            console.log("User not found");
        }
    } catch (e) {
        console.error(e);
    }
    // Just exit, no need to close manually if instance not available
    process.exit(0);
})();
