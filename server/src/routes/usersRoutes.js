const express = require('express');
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
} = require('../controllers/usersController');

const { protect, requireOwner } = require('../middleware/authMiddleware');

router.use(protect, requireOwner);

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
