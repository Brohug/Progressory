const express = require('express');
const router = express.Router();

const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember
} = require('../controllers/membersController');

const { protect } = require('../middleware/authMiddleware');
const progressRoutes = require('./progressRoutes');

router.post('/', protect, createMember);
router.get('/', protect, getMembers);

router.use('/:id/progress', progressRoutes);

router.get('/:id', protect, getMemberById);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, deleteMember);

module.exports = router;