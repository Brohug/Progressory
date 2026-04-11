const express = require('express');
const router = express.Router();

const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addClassTopic,
  getClassTopics,
  deleteClassTopic,
  addClassTrainingEntry,
  getClassTrainingEntries,
  deleteClassTrainingEntry
} = require('../controllers/classController');

const { protect } = require('../middleware/authMiddleware');
const attendanceRoutes = require('./attendanceRoutes');

router.post('/', protect, createClass);
router.get('/', protect, getClasses);
router.get('/:id', protect, getClassById);
router.put('/:id', protect, updateClass);
router.delete('/:id', protect, deleteClass);

router.post('/:id/topics', protect, addClassTopic);
router.get('/:id/topics', protect, getClassTopics);
router.delete('/:id/topics/:topicEntryId', protect, deleteClassTopic);

router.post('/:id/training-entries', protect, addClassTrainingEntry);
router.get('/:id/training-entries', protect, getClassTrainingEntries);
router.delete('/:id/training-entries/:entryId', protect, deleteClassTrainingEntry);

router.use('/:id/members', attendanceRoutes);

module.exports = router;