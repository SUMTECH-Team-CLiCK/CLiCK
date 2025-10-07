import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const port = 3001; // 백엔드 서버 포트

app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱

// API 라우트 연결
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
