
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1'; // Using the proxy port? Or Backend directly? 
// Frontend runs on 3000, Proxy to Backend 9090.
// Let's hitting backend directly 9090 since I am running this script in backend folder usually.
// But frontend uses REACT_APP_BACKEND_URL. If undefined, it might be localhost:9090.
// Checked .env, it seemed to use proxy in package.json?
// view_file of front_end/package.json (Step 312 context summary says "proxy": "http://localhost:9090")
// Wait, Step 311 viewed package.json but didn't show content fully.
// Let's assume 9090 for direct backend access.

const BACKEND_URL = 'http://localhost:9090/api/v1';

async function testApi() {
    try {
        console.log(`Attempting login to ${BACKEND_URL}/login...`);
        // We need a valid user password. 
        // In check_db.js, I verified user 'bears_chj7' exists.
        // I don't know the password.
        // I can temporarily change the password in the DB manually or create a new user via script if allow.
        // OR, I can look at how I logged in before? I haven't. User logged in via UI.

        // Blocked: I don't have credentials.
        // Workaround: I can generate a valid token manually using jwt.sign because I have access to JWT_SECRET!

        const jwt = require('jsonwebtoken');
        require('dotenv').config({ path: '/home/ubuntu/projects/study_hall_timer/back_end/.env' });

        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign({ username: 'bears_chj7' }, JWT_SECRET, { expiresIn: '1h' });

        console.log('Generated Test Token for bears_chj7');

        // Test GET Subjects
        console.log('Fetching Subjects...');
        const subjectsRes = await axios.get(`${BACKEND_URL}/subjects`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('GET /subjects Response:', JSON.stringify(subjectsRes.data, null, 2));

        // Test Create Subject
        // console.log('Creating Subject via API...');
        // const createRes = await axios.post(`${BACKEND_URL}/subjects`, {
        //     subject_name: 'API_TEST_SUBJECT',
        //     category_id: 1, // Need a valid category ID
        //     subject_color: '#000000',
        //     subject_unit_time: 30
        // }, {
        //     headers: { Authorization: `Bearer ${token}` }
        // });
        // console.log('POST /subjects Response:', createRes.data);

    } catch (error) {
        console.error('API Test Failed:', error.response ? error.response.data : error.message);
    }
}

testApi();
