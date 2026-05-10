const express = require('express');
const router = express.Router();

const {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deactivateProgram
} = require('../controllers/programController');

const { protect, requireStaff, requireManagement } = require('../middleware/authMiddleware');

router.get('/', protect, requireStaff, getPrograms);
router.get('/:id', protect, requireStaff, getProgramById);

router.post('/', protect, requireManagement, createProgram);
router.put('/:id', protect, requireManagement, updateProgram);
router.patch('/:id/deactivate', protect, requireManagement, deactivateProgram);

module.exports = router;
