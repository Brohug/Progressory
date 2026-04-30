const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  getMemberAccessInvite,
  setMemberAccessPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/member-access/:token', getMemberAccessInvite);
router.post('/member-access/:token', setMemberAccessPassword);
router.get('/me', protect, getMe);

module.exports = router;
