const express = require('express');
const router = express.Router();

const {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deactivateProgram
} = require('../controllers/programController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProgram);
router.get('/', protect, getPrograms);
router.get('/:id', protect, getProgramById);
router.put('/:id', protect, updateProgram);
router.patch('/:id/deactivate', protect, deactivateProgram);

module.exports = router;