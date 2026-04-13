const express = require('express');
const router = express.Router();

const {
  getTrainingScenarios,
  createTrainingScenario,
  updateTrainingScenario,
  deactivateTrainingScenario
} = require('../controllers/trainingScenarioController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTrainingScenarios);
router.post('/', protect, createTrainingScenario);
router.put('/:id', protect, updateTrainingScenario);
router.patch('/:id/deactivate', protect, deactivateTrainingScenario);

module.exports = router;