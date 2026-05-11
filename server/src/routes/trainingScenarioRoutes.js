const express = require('express');
const router = express.Router();

const {
  getTrainingScenarios,
  createTrainingScenario,
  updateTrainingScenario,
  deactivateTrainingScenario,
  deleteTrainingScenario
} = require('../controllers/trainingScenarioController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.get('/', protect, requireStaff, getTrainingScenarios);

router.post('/', protect, requireStaff, createTrainingScenario);
router.put('/:id', protect, requireStaff, updateTrainingScenario);
router.patch('/:id/deactivate', protect, requireStaff, deactivateTrainingScenario);
router.delete('/:id', protect, requireStaff, deleteTrainingScenario);

module.exports = router;
