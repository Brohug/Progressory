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
  deleteClassTrainingEntry,
  applyClassProgress
} = require('../controllers/classController');

const { protect, requireStaff } = require('../middleware/authMiddleware');
const attendanceRoutes = require('./attendanceRoutes');

router.use(protect, requireStaff);

router.post('/', createClass);
router.get('/', getClasses);
router.get('/:id', getClassById);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

router.post('/:id/topics', addClassTopic);
router.get('/:id/topics', getClassTopics);
router.delete('/:id/topics/:topicEntryId', deleteClassTopic);

router.post('/:id/training-entries', addClassTrainingEntry);
router.get('/:id/training-entries', getClassTrainingEntries);
router.delete('/:id/training-entries/:entryId', deleteClassTrainingEntry);
router.post('/:id/apply-progress', applyClassProgress);

router.use('/:id/members', attendanceRoutes);

module.exports = router;
