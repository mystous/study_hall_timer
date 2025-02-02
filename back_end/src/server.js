// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 9090; // 환경변수에서 포트를 가져오거나 기본값 사용
const db = require('./db_operation');
const passwordManager = require('./authorization');
const jwt = require('jsonwebtoken');
const { logger, addRequestLog } = require('./utils/utils');

const log = logger();

// (1) JSON 파싱 및 기본 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS 설정

const allowedOrigins = ['http://localhost:3000', 'http://studyhalltimer.com', 'http://studyhalltimer.com:3000'];

// JWT 시크릿 키 설정 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // 인증 정보 포함 허용
}));


// (2) 라우팅 예시
app.get('/', (req, res) => {
  res.send('Hello from Express WAS!');
});

// 현재 시간을 반환하는 테스트 API
app.get('/api/v1/test', (req, res) => {
  const currentTime = new Date().toLocaleString('ko-KR');
  res.json({ timestamp: currentTime });
});

// (3) 서버 실행
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function validateAuthHeaderWithUsername(req, res, usernameObj) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
          success: false,
          message: 'No token provided'
      });
      addRequestLog(req, res, 'user_groups', req.body.username, false, 'No token provided:' + authHeader);
      return false;
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  usernameObj.value = decoded.username;
  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    addRequestLog(req, res, 'user_groups', req.body.username, false, 'Invalid token');
    return false;
  }

  return true;
}

function validateAuthHeader(req, res) {
  let username = "";
  return validateAuthHeaderWithUsername(req, res, username);
}

// 사용자의 그룹 정보를 조회하는 API 엔드포인트
app.get('/api/v1/user/user_groups', async (req, res) => {
    try {
     
      const username = { value: '' };
      if (!validateAuthHeaderWithUsername(req, res, username)) {
          return res;
      }

      // 사용자의 그룹 정보 조회
      const groups = await db.getUserGroups(username.value);

      res.json({
          success: true,
          groups: groups
      });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            addRequestLog(req, res, 'user_groups', req.body.username, false, 'Invalid or expired token:' + error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        addRequestLog(req, res, 'user_groups', req.body.username, false, 'Internal server error:' + error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// 로그인 API 엔드포인트
app.post('/api/v1/login', async (req, res) => {
  
  
  try {
    const { username, password } = req.body;
    const salt = await db.getUserSalt(username);

    if (!salt) {
      addRequestLog(req, res, 'login', username, false);
      return res.status(401).json({ 
        success: false, 
        message: 'Cannot find user.' 
      });
    }

    const hashedPassword = await db.getUserPasswordHash(username);
    const isValid = await passwordManager.verifyPassword(password, hashedPassword, salt);

    if (!isValid) {
      addRequestLog(req, res, 'login', username, false);
      return res.status(401).json({ 
        success: false, 
        message: 'Password does not match.' 
      });
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { username: username },
      JWT_SECRET,
      { expiresIn: '1h' } // 토큰 유효기간 1시간
    );

    const refreshToken = jwt.sign(
      { username: username },
      JWT_SECRET,
      { expiresIn: '14d' } // refresh 토큰 유효기간 14일
    );

    // 로그인 성공 및 토큰 전달    
    addRequestLog(req, res, 'login', username, true);
    res.json({ 
      success: true,
      message: 'Login successful',
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken
      },
      user: {
        username: username
        // 필요한 경우 추가 사용자 정보
      }
    });

    // 토큰 저장
    await db.saveUserTokens(username, accessToken, refreshToken);
    // 로그인 성공 로그 저장
  


  } catch (error) {
    addRequestLog(req, res, 'login', req.body.username, false, 'Login error:' + error.message);
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred.' 
    });
  }
});

// Admin routes
app.post('/api/v1/admin/users', async (req, res) => {
  try {

    if (!validateAuthHeader(req, res)) {
      return res;
    }

    const users = await db.getUsers();
    addRequestLog(req, res, 'get_users', req.body.username, true);

    res.json({
      success: true,
      users: users
    });

  } catch (error) {
    addRequestLog(req, res, 'get_users', req.body.username, false, 'Error getting users:' + error.message);
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.'
    });
  }
});

app.post('/api/v1/admin/groups', async (req, res) => {
  try {
    if (!validateAuthHeader(req, res)) {
      return res;
    }

    const groups = await db.getGroups();
    if(!groups) {
      const response = res.status(404).json({
        success: false,
        message: 'No groups found'
      });
      addRequestLog(req, res, 'get_groups', req.body.username, false, 'No groups found');
      return response;
    }
    addRequestLog(req, res, 'get_groups', req.body.username, true);

    res.json({
      success: true,
      groups: groups
    });

  } catch (error) {
    addRequestLog(req, res, 'get_groups', req.body.username, false, 'Error getting groups:' + error.message);
    console.error('Error getting groups:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.'
    });
  }
});

app.post('/api/v1/admin/groups/:groupId/members', async (req, res) => {
  try {
    console.log(req.body.username);
    const groupId = req.params.groupId;
    console.log(groupId);
    const members = await db.getGroupMembers(groupId);
    console.log(members);
    addRequestLog(req, res, 'get_group_members', req.body.username, true);

    res.json({
      success: true,
      members: members
    });

  } catch (error) {
    addRequestLog(req, res, 'get_group_members', req.body.username, false, 'Error getting group members:' + error.message);
    console.error('Error getting group members:', error);
    res.status(500).json({
      success: false, 
      message: 'Server error occurred.'
    });
  }
});

app.post('/api/v1/subjects', async (req, res) => {
  try {
    if (!validateAuthHeader(req, res)) {
      return res;
    }

    const username = req.body.username;

    const user = await db.getUser(username);

    if (!user) {
      const response = res.status(404).json({
        success: false,
        message: 'User not found'
      });
      addRequestLog(req, res, 'subjects', username, false, 'User not found');
      return response;
    }

    const subjects = await db.getSubjects(user.user_id);
    addRequestLog(req, res, 'subjects', username, true);

    res.json({
      success: true,
      subjects: subjects
    });

  } catch (error) {
    addRequestLog(req, res, 'subjects', req.body.username, false, 'Error getting study subjects:' + error.message);
    console.error('Error getting study subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.'
    });
  }
});

app.post('/api/v1/time_table', async (req, res) => {
  try {
    if (!validateAuthHeader(req, res)) {
      return res;
    }
    const username = req.body.username;

    const user = await db.getUser(username);
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const timeTable = await db.getTimeTableByDateRange(user.user_id, startDate, endDate);
    if(!timeTable) {
    
      const response = res.status(404).json({
        success: false,
        message: 'No time table found'
      });
      addRequestLog(req, res, 'time_table', req.body.username, false, 'No time table found');
      return response;
    }
    addRequestLog(req, res, 'time_table', req.body.username, true);
    res.json({
        success: true,
        schedules: timeTable
      });
  } catch (error) {
    
    console.error('Error getting time table:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.'
    });
    addRequestLog(req, res, 'time_table', req.body.username, false, 'Error getting time table:' + error.message);
  }
});

app.put('/api/v1/time_table/add', async (req, res) => {
  try {
    if (!validateAuthHeader(req, res)) {
      return res;
    }
    const username = req.body.username;
    const userId = req.body.userId;
    const subjectId = req.body.subjectId;
    const scheduledTime = req.body.scheduledTime;
    const startTime = req.body.startTime;
    const dimmed = req.body.dimmed;

    await db.addTimeTableSchedule(userId, subjectId, scheduledTime, startTime, dimmed); 
    addRequestLog(req, res, 'add_time_table_schedule', username, true);
    res.json({
      success: true,
      message: 'Time table schedule added successfully'
    });
  } catch (error) {
    addRequestLog(req, res, 'add_time_table_schedule', username, false, 'Error adding time table schedule:' + error.message);
    console.error('Error adding time table schedule:', error);
    res.status(500).json({
      success: false, message: 'Server error occurred.' });
  }
});

db.testConn();
