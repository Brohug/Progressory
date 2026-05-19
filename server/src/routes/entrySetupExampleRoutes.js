const express = require('express');

const {
  getEntrySetupExamples,
  createEntrySetupExample,
  updateEntrySetupExample,
  deleteEntrySetupExample
} = require('../controllers/entrySetupExampleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getEntrySetupExamples);
router.post('/', protect, createEntrySetupExample);
router.put('/:id', protect, updateEntrySetupExample);
router.delete('/:id', protect, deleteEntrySetupExample);

module.exports = router;
