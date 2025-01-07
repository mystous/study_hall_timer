// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 9090; // 환경변수에서 포트를 가져오거나 기본값 사용
const db = require('./database');
const passwordManager = require('./authorization');
const jwt = require('jsonwebtoken');


// (1) JSON 파싱 및 기본 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS 설정

const allowedOrigins = ['http://localhost:3000', 'http://studyhalltimer.com', 'http://studyhalltimer.com:3000'];

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

// JWT 시크릿 키 설정 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 로그인 API 엔드포인트
app.post('/api/v1/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const salt = await db.getUserSalt(username);

    if (!salt) {
      return res.status(401).json({ 
        success: false, 
        message: 'Cannot find user.' 
      });
    }

    const hashedPassword = await passwordManager.hashPassword(password, salt);
    const isValid = await passwordManager.verifyPassword(password, hashedPassword, salt);

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Password does not match.' 
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { username: username },
      JWT_SECRET,
      { expiresIn: '24h' } // 토큰 유효기간 24시간
    );

    // 로그인 성공 및 토큰 전달
    res.json({ 
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        username: username
        // 필요한 경우 추가 사용자 정보
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred.' 
    });
  }
});



db.testConnection();