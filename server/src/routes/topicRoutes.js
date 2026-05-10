const express = require('express');
const router = express.Router();

const {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic
} = require('../controllers/topicController');

const { protect, requireStaff, requireManagement } = require('../middleware/authMiddleware');

router.get('/', protect, requireStaff, getTopics);
router.get('/:id', protect, requireStaff, getTopicById);

router.post('/', protect, requireManagement, createTopic);
router.put('/:id', protect, requireManagement, updateTopic);
router.delete('/:id', protect, requireManagement, deleteTopic);

module.exports = router;
