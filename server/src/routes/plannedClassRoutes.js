const express = require('express');
const router = express.Router();

const {
  getPlannedClasses,
  createPlannedClass,
  updatePlannedClass,
  deletePlannedClass,
  processDuePlannedClasses,
  completePlannedClass
} = require('../controllers/plannedClassController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.get('/', protect, getPlannedClasses);
router.post('/', protect, requireStaff, createPlannedClass);
router.post('/process-due', protect, requireStaff, processDuePlannedClasses);
router.put('/:id', protect, requireStaff, updatePlannedClass);
router.delete('/:id', protect, requireStaff, deletePlannedClass);
router.post('/:id/complete', protect, requireStaff, completePlannedClass);

module.exports = router;
