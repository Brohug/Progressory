const express = require('express');
const router = express.Router();

const {
  getRecentClasses,
  getTopicCoverage,
  getNeglectedTopics,
  getTrainingMethodUsage
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

router.get('/recent-classes', protect, getRecentClasses);
router.get('/topic-coverage', protect, getTopicCoverage);
router.get('/neglected-topics', protect, getNeglectedTopics);
router.get('/training-method-usage', protect, getTrainingMethodUsage);

module.exports = router;