const express = require('express');
const router = express.Router();

const {
  createUser,
  createMemberAccessInvite,
  createStaffAccessInvite,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser
} = require('../controllers/usersController');

const { protect, requireOwner } = require('../middleware/authMiddleware');

router.use(protect, requireOwner);

router.post('/member-access', createMemberAccessInvite);
router.post('/staff-access', createStaffAccessInvite);
router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/activate', activateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
