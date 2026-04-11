const express = require('express');
const router = express.Router();

const {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  deleteLibraryEntry
} = require('../controllers/libraryController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createLibraryEntry);
router.get('/', protect, getLibraryEntries);
router.get('/:id', protect, getLibraryEntryById);
router.put('/:id', protect, updateLibraryEntry);
router.delete('/:id', protect, deleteLibraryEntry);

module.exports = router;