const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  addMemberToClass,
  addMembersToClassBulk,
  getClassMembers,
  removeMemberFromClass
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addMemberToClass);
router.post('/bulk', protect, addMembersToClassBulk);
router.get('/', protect, getClassMembers);
router.delete('/:classMemberId', protect, removeMemberFromClass);

module.exports = router;
