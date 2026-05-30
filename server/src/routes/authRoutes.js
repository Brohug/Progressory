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
const {
  loginLimiter,
  registerLimiter,
  inviteAccessLimiter
} = require('../middleware/rateLimit');

router.post('/register', registerLimiter, (req, res) => {
  return res.status(403).json({
    message: 'Owner account creation requires founder approval.'
  });
});
router.post('/login', loginLimiter, login);
router.get('/member-access/:token', inviteAccessLimiter, getMemberAccessInvite);
router.post('/member-access/:token', inviteAccessLimiter, setMemberAccessPassword);
router.get('/staff-access/:token', inviteAccessLimiter, getStaffAccessInvite);
router.post('/staff-access/:token', inviteAccessLimiter, setStaffAccessPassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;
