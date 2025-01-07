// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 9090; // 환경변수에서 포트를 가져오거나 기본값 사용
const db = require('./database');

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

const passwordManager = require('./authorization');

// 로그인 API 엔드포인트
app.post('/api/v1/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(username, password);

    // TODO: 실제 데이터베이스에서 사용자 정보 조회 로직 구현 필요
    // 임시 테스트용 사용자 정보
    const mockUserData = {
      username: 'user',
      passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // "password"의 해시값
      salt: 'testsalt'
    };

    if (username !== mockUserData.username) {
      return res.status(401).json({ 
        success: false, 
        message: '사용자를 찾을 수 없습니다.' 
      });
    }

    const isValid = await passwordManager.verifyPassword(
      password,
      mockUserData.passwordHash,
      mockUserData.salt
    );

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: '비밀번호가 일치하지 않습니다.' 
      });
    }

    // 로그인 성공
    res.json({ 
      success: true,
      message: '로그인 성공',
      user: {
        username: mockUserData.username
        // 필요한 경우 추가 사용자 정보
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});



db.testConnection();