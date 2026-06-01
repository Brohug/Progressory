const express = require('express');
const {
  createPageViewEvent,
  createPageExitEvent,
  createActionEvent
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/page-view', createPageViewEvent);
router.post('/page-exit', createPageExitEvent);
router.post('/action', createActionEvent);

module.exports = router;
