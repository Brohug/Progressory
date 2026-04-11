const express = require('express');
const router = express.Router();

const {
  createTrainingMethod,
  getTrainingMethods,
  getTrainingMethodById,
  updateTrainingMethod,
  deleteTrainingMethod
} = require('../controllers/trainingMethodController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTrainingMethod);
router.get('/', protect, getTrainingMethods);
router.get('/:id', protect, getTrainingMethodById);
router.put('/:id', protect, updateTrainingMethod);
router.delete('/:id', protect, deleteTrainingMethod);

module.exports = router;