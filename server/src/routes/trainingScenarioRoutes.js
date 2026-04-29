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

router.use(protect, requireStaff);

router.get('/', getTrainingScenarios);
router.post('/', createTrainingScenario);
router.put('/:id', updateTrainingScenario);
router.patch('/:id/deactivate', deactivateTrainingScenario);
router.delete('/:id', deleteTrainingScenario);

module.exports = router;
