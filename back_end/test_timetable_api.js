
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/home/ubuntu/projects/study_hall_timer/back_end/.env' });

const BACKEND_URL = 'http://localhost:9090/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testTimeTableApi() {
    try {
        console.log('Generating Test Token for bears_chj7...');
        const token = jwt.sign({ username: 'bears_chj7' }, JWT_SECRET, { expiresIn: '1h' });

        // 1. Create a Schedule
        const startTime = new Date();
        startTime.setHours(10, 0, 0, 0);
        const startTimeStr = startTime.toISOString().replace('T', ' ').substring(0, 19);
        // Note: DB expects specific format? Sequelize usually handles ISO strings.
        // Let's use ISO string as frontend does: 2024-01-01T10:00:00.000Z
        const isoStartTime = startTime.toISOString();

        console.log('Creating Schedule via API...');
        // We need a valid subject_id. check_db.js showed subjects exist.
        // Let's assume subject_id 1 exists (or any from previous logs).
        // From logs: subject_id: 121 exists.

        const payload = {
            username: 'bears_chj7',
            schedules: [{
                subject_id: 121, // math
                scheduled_time: 30,
                start_time: isoStartTime,
                special_text: "API_TEST_SCHEDULE",
                dimmed: false
            }]
        };

        const createRes = await axios.post(`${BACKEND_URL}/time_table`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('POST /time_table Response:', createRes.data);

        // 2. Verify it exists
        console.log('Verifying via GET...');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);

        const getRes = await axios.get(`${BACKEND_URL}/time_table`, {
            params: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        const found = getRes.data.schedules.find(s => s.special_text === "API_TEST_SCHEDULE");
        if (found) {
            console.log('SUCCESS: Schedule verified in DB via API.');
            console.log(found);
        } else {
            console.log('FAILURE: Schedule not found in GET response.');
            console.log('Received:', getRes.data.schedules.length, 'schedules');
        }

    } catch (error) {
        console.error('API Test Failed:', error.response ? error.response.data : error.message);
    }
}

testTimeTableApi();
