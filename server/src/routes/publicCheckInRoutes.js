const express = require('express');
const {
  getPublicCheckInPage,
  createPublicAccessSetup,
  createQuickCheckIn,
  getCheckInTools
} = require('../controllers/publicCheckInController');
const { protect, requireStaff } = require('../middleware/authMiddleware');
const { publicCheckInLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/tools/current', protect, requireStaff, getCheckInTools);
router.get('/:slug', publicCheckInLimiter, getPublicCheckInPage);
router.post('/:slug/access-setup', publicCheckInLimiter, createPublicAccessSetup);
router.post('/:slug/quick-check-in', publicCheckInLimiter, createQuickCheckIn);

module.exports = router;
