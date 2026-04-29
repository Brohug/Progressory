const express = require('express');
const router = express.Router();

const {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deactivateProgram
} = require('../controllers/programController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.use(protect, requireStaff);

router.post('/', createProgram);
router.get('/', getPrograms);
router.get('/:id', getProgramById);
router.put('/:id', updateProgram);
router.patch('/:id/deactivate', deactivateProgram);

module.exports = router;
