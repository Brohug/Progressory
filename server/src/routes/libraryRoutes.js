const express = require('express');
const router = express.Router();

const {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  deleteLibraryEntry
} = require('../controllers/libraryController');

const { protect, requireManagement } = require('../middleware/authMiddleware');

router.get('/', protect, getLibraryEntries);
router.get('/:id', protect, getLibraryEntryById);
router.post('/', protect, requireManagement, createLibraryEntry);
router.put('/:id', protect, requireManagement, updateLibraryEntry);
router.delete('/:id', protect, requireManagement, deleteLibraryEntry);

module.exports = router;
