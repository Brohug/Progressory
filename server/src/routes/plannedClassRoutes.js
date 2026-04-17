const express = require('express');
const router = express.Router();

const {
  getPlannedClasses,
  createPlannedClass,
  updatePlannedClass,
  deletePlannedClass,
  completePlannedClass
} = require('../controllers/plannedClassController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPlannedClasses);
router.post('/', protect, createPlannedClass);
router.put('/:id', protect, updatePlannedClass);
router.delete('/:id', protect, deletePlannedClass);
router.post('/:id/complete', protect, completePlannedClass);

module.exports = router;
