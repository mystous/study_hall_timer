const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());

// 테스트용 API 엔드포인트
app.get('/api/test', (req, res) => {
  res.json({ message: '서버에서 보내는 테스트 메시지입니다!' });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행중입니다`);
});