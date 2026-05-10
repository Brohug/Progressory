const express = require('express');
const router = express.Router();

const {
  createTrainingMethod,
  getTrainingMethods,
  getTrainingMethodById,
  updateTrainingMethod,
  deleteTrainingMethod
} = require('../controllers/trainingMethodController');

const { protect, requireStaff, requireManagement } = require('../middleware/authMiddleware');

router.get('/', protect, requireStaff, getTrainingMethods);
router.get('/:id', protect, requireStaff, getTrainingMethodById);

router.post('/', protect, requireManagement, createTrainingMethod);
router.put('/:id', protect, requireManagement, updateTrainingMethod);
router.delete('/:id', protect, requireManagement, deleteTrainingMethod);

module.exports = router;
