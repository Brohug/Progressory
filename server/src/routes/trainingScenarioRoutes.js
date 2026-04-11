const express = require('express');
const router = express.Router();

const {
  createTrainingScenario,
  getTrainingScenarios,
  getTrainingScenarioById,
  updateTrainingScenario,
  deleteTrainingScenario
} = require('../controllers/trainingScenarioController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTrainingScenario);
router.get('/', protect, getTrainingScenarios);
router.get('/:id', protect, getTrainingScenarioById);
router.put('/:id', protect, updateTrainingScenario);
router.delete('/:id', protect, deleteTrainingScenario);

module.exports = router;