const express = require('express');
const router = express.Router();

const {
  getRecentClasses,
  getTopicCoverage,
  getNeglectedTopics,
  getTrainingMethodUsage
} = require('../controllers/reportController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.use(protect, requireStaff);

router.get('/recent-classes', getRecentClasses);
router.get('/topic-coverage', getTopicCoverage);
router.get('/neglected-topics', getNeglectedTopics);
router.get('/training-method-usage', getTrainingMethodUsage);

module.exports = router;
