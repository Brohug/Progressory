const express = require('express');
const router = express.Router();

const {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic
} = require('../controllers/topicController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTopic);
router.get('/', protect, getTopics);
router.get('/:id', protect, getTopicById);
router.put('/:id', protect, updateTopic);
router.delete('/:id', protect, deleteTopic);

module.exports = router;