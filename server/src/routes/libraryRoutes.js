const express = require('express');
const router = express.Router();

const {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  deleteLibraryEntry
} = require('../controllers/libraryController');

const { protect, requireStaff } = require('../middleware/authMiddleware');

router.get('/', protect, getLibraryEntries);
router.get('/:id', protect, getLibraryEntryById);
router.post('/', protect, requireStaff, createLibraryEntry);
router.put('/:id', protect, requireStaff, updateLibraryEntry);
router.delete('/:id', protect, requireStaff, deleteLibraryEntry);

module.exports = router;
