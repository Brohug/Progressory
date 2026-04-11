const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  addMemberToClass,
  getClassMembers,
  removeMemberFromClass
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addMemberToClass);
router.get('/', protect, getClassMembers);
router.delete('/:classMemberId', protect, removeMemberFromClass);

module.exports = router;