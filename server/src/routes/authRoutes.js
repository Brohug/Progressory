const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getMemberAccessInvite,
  setMemberAccessPassword,
  getStaffAccessInvite,
  setStaffAccessPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/member-access/:token', getMemberAccessInvite);
router.post('/member-access/:token', setMemberAccessPassword);
router.get('/staff-access/:token', getStaffAccessInvite);
router.post('/staff-access/:token', setStaffAccessPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;
