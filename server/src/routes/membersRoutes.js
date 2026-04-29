const express = require('express');
const router = express.Router();

const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember
} = require('../controllers/membersController');

const { protect, requireStaff } = require('../middleware/authMiddleware');
const progressRoutes = require('./progressRoutes');

router.use(protect, requireStaff);

router.post('/', createMember);
router.get('/', getMembers);

router.use('/:id/progress', progressRoutes);

router.get('/:id', getMemberById);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
