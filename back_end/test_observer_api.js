const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/home/ubuntu/projects/study_hall_timer/back_end/.env' });
const { User } = require('./src/database');

const BASE_URL = 'http://localhost:9090/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testObserverAPI() {
    try {
        console.log('Setting up test users...');

        // Ensure users exist
        const [guardian, createdG] = await User.findOrCreate({
            where: { username: 'guardian_user' },
            defaults: {
                username: 'guardian_user',
                salt: 'test_salt',
                password_hash: 'test_hash'
            }
        });

        const [student, createdS] = await User.findOrCreate({
            where: { username: 'student_user' },
            defaults: {
                username: 'student_user',
                salt: 'test_salt',
                password_hash: 'test_hash'
            }
        });

        const guardianId = guardian.user_id;
        const studentId = student.user_id;

        console.log(`Guardian: ${guardian.username} (${guardianId}), Student: ${student.username} (${studentId})`);

        // Generate Tokens (Mocking Login)
        // Note: Payload MUST match what authMiddleware expects. 
        // In authMiddleware.js: const validateAuthHeaderWithUsername ... req.user = decoded;
        // In observerController: const guardianId = req.user.user_id; -> Wait!
        // Let's check authMiddleware and observerController connection.
        // authMiddleware decodes token to req.user. 
        // observerController uses req.user.user_id.
        // So token payload MUST contain user_id.

        // Wait, earlier authService.js login implementation:
        // const accessToken = jwt.sign({ username: username }, ...);
        // It ONLY put username in payload!
        // So authMiddleware decodes { username: ... }.
        // BUT observerController tries to access req.user.user_id !
        // THIS IS A BUG found by thinking about tests!

        // I need to:
        // 1. Fix authService.js to include user_id in token.
        // 2. Fix test script to include user_id in token.
        // 3. (Or fix controller to look up user by username from token).

        // Best practice: Put user_id in token.

        // For now, I will proceed with fixing the test script to include user_id, 
        // AND ALSO FIX authService.js to include user_id in the next step.
        // If I only fix test script, the real app will fail.

        const guardianToken = jwt.sign({ username: guardian.username, user_id: guardianId }, JWT_SECRET, { expiresIn: '1h' });
        const studentToken = jwt.sign({ username: student.username, user_id: studentId }, JWT_SECRET, { expiresIn: '1h' });

        // 3. Guardian sends request to Student
        console.log('Guardian sending observation request to Student...');
        try {
            await axios.post(`${BASE_URL}/observer/request`, {
                studentUsername: 'student_user'
            }, {
                headers: { Authorization: `Bearer ${guardianToken}` }
            });
            console.log('Request sent successfully.');
        } catch (e) {
            console.log('Request sending failed (might be already existing):', e.response?.data?.message || e.message);
        }

        // 4. Student checks pending requests
        console.log('Student checking pending requests...');
        const pendingRes = await axios.get(`${BASE_URL}/observer/pending`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        const requests = pendingRes.data.requests;
        console.log('Pending requests:', requests ? requests.length : 0);

        if (requests && requests.length > 0) {
            const relationId = requests[0].relation_id;
            console.log(`Accepting request ${relationId}...`);

            // 5. Student accepts request
            await axios.post(`${BASE_URL}/observer/respond`, {
                relationId: relationId,
                action: 'accept'
            }, {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            console.log('Request accepted.');
        }

        // 6. Guardian checks observed students
        console.log('Guardian checking observed students...');
        const studentsRes = await axios.get(`${BASE_URL}/observer/students`, {
            headers: { Authorization: `Bearer ${guardianToken}` }
        });
        console.log('Observed students:', studentsRes.data.students);

        // 7. Student checks observers
        console.log('Student checking observers...');
        const observersRes = await axios.get(`${BASE_URL}/observer/observers`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('Observers:', observersRes.data.observers);

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

testObserverAPI();
