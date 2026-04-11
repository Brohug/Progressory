const express = require('express');
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
} = require('../controllers/usersController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createUser);
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.patch('/:id/deactivate', protect, deactivateUser);

module.exports = router;