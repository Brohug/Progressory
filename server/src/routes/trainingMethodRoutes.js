const express = require('express');
const router = express.Router();

const {
  createTrainingMethod,
  getTrainingMethods,
  getTrainingMethodById,
  updateTrainingMethod,
  deleteTrainingMethod
} = require('../controllers/trainingMethodController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.use(protect, requireStaff);

router.post('/', createTrainingMethod);
router.get('/', getTrainingMethods);
router.get('/:id', getTrainingMethodById);
router.put('/:id', updateTrainingMethod);
router.delete('/:id', deleteTrainingMethod);

module.exports = router;
