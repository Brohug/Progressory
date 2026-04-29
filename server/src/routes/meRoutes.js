const express = require('express');
const router = express.Router();

const { getMyProgress } = require('../controllers/progressController');
const { protect, requireRoles } = require('../middleware/authMiddleware');

router.get('/progress', protect, requireRoles('member'), getMyProgress);

module.exports = router;
