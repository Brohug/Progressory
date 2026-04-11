const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createOrUpdateMemberProgress,
  getMemberProgress
} = require('../controllers/progressController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrUpdateMemberProgress);
router.get('/', protect, getMemberProgress);

module.exports = router;