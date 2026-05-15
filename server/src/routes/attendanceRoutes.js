const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  addMemberToClass,
  addMembersToClassBulk,
  getClassMembers,
  removeMemberFromClass
} = require('../controllers/attendanceController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.post('/', protect, requireStaff, addMemberToClass);
router.post('/bulk', protect, requireStaff, addMembersToClassBulk);
router.get('/', protect, requireStaff, getClassMembers);
router.delete('/:classMemberId', protect, requireStaff, removeMemberFromClass);

module.exports = router;
