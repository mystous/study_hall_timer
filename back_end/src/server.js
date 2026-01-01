require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 9090;
const db = require('./db_operation'); // Keep legacy db conn for now as models are likely initialized there or database.js
const { logger } = require('./utils/utils');
const apiRoutes = require('./routes/apiRoutes');

const log = logger();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://studyhalltimer.com',
  'http://studyhalltimer.com:3000',
  'https://studyhalltimer.com',
  'https://studyhalltimer.com:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없는 경우 (같은 도메인에서의 요청 등) 허용
    if (!origin) {
      return callback(null, true);
    }
    
    // 허용된 origin 목록에 있는지 확인
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // studyhalltimer.com 도메인을 포함하는 모든 origin 허용
    if (origin.includes('studyhalltimer.com')) {
      return callback(null, true);
    }
    
    // localhost를 포함하는 모든 origin 허용 (개발 환경)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // 그 외의 경우 거부
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express WAS!');
});

app.use('/api/v1', apiRoutes);

// Server Start
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  db.testConn();
});
