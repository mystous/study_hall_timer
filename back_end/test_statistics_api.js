const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: '/home/ubuntu/projects/study_hall_timer/back_end/.env' });

const API_URL = 'http://localhost:9090/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testTimeTable() {
    try {
        // 1. Generate Token
        // Assuming 'bears_chj7' is a valid user. If not, we might get empty array, but that's fine for structure check if data exists.
        console.log('Generating Test Token for bears_chj7...');
        const token = jwt.sign({ username: 'bears_chj7' }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated.');

        // 2. Get TimeTable
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7); // Last 7 days to ensure data
        const end = new Date(today);

        console.log('Fetching TimeTable...');
        const response = await axios.get(`${API_URL}/time_table`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                startDate: start.toISOString(),
                endDate: end.toISOString()
            }
        });

        if (response.data.success && response.data.schedules.length > 0) {
            console.log('Sample Schedule Item Keys:', Object.keys(response.data.schedules[0]));
            console.log('Sample Schedule Item Structure:', JSON.stringify(response.data.schedules[0], null, 2));
        } else {
            console.log('Success, but no schedules found or success flag false:', response.data);
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testTimeTable();
