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