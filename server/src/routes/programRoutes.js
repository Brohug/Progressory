const express = require('express');
const router = express.Router();

const {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram
} = require('../controllers/programController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProgram);
router.get('/', protect, getPrograms);
router.get('/:id', protect, getProgramById);
router.put('/:id', protect, updateProgram);
router.delete('/:id', protect, deleteProgram);

module.exports = router;