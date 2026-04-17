const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const programRoutes = require('./routes/programRoutes');
const topicRoutes = require('./routes/topicRoutes');
const trainingMethodRoutes = require('./routes/trainingMethodRoutes');
const trainingScenarioRoutes = require('./routes/trainingScenarioRoutes');
const classRoutes = require('./routes/classRoutes');
const plannedClassRoutes = require('./routes/plannedClassRoutes');
const reportRoutes = require('./routes/reportRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const membersRoutes = require('./routes/membersRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');

    res.status(200).json({
      message: 'API is running',
      database: rows[0].ok === 1 ? 'connected' : 'not connected'
    });
  } catch (error) {
    console.error('Health check error:', error.message);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/training-methods', trainingMethodRoutes);
app.use('/api/training-scenarios', trainingScenarioRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/planned-classes', plannedClassRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
