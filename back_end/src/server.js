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

const allowedOrigins = ['http://localhost:3000', 'http://studyhalltimer.com', 'http://studyhalltimer.com:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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
