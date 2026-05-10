const express = require('express');
const router = express.Router();

const {
  getTrainingScenarios,
  createTrainingScenario,
  updateTrainingScenario,
  deactivateTrainingScenario,
  deleteTrainingScenario
} = require('../controllers/trainingScenarioController');

const { protect, requireStaff, requireManagement } = require('../middleware/authMiddleware');

router.get('/', protect, requireStaff, getTrainingScenarios);

router.post('/', protect, requireManagement, createTrainingScenario);
router.put('/:id', protect, requireManagement, updateTrainingScenario);
router.patch('/:id/deactivate', protect, requireManagement, deactivateTrainingScenario);
router.delete('/:id', protect, requireManagement, deleteTrainingScenario);

module.exports = router;
