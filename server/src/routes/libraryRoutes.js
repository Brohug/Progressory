const express = require('express');
const router = express.Router();

const {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  hideLibraryEntry,
  restoreLibraryEntry,
  deleteLibraryEntry,
  reportLibraryEntry,
  listLibraryContentReports,
  reviewLibraryContentReport
} = require('../controllers/libraryController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLibraryEntries);
router.get('/reports', protect, listLibraryContentReports);
router.get('/:id', protect, getLibraryEntryById);
router.post('/', protect, createLibraryEntry);
router.post('/:id/reports', protect, reportLibraryEntry);
router.patch('/reports/:reportId/review', protect, reviewLibraryContentReport);
router.put('/:id', protect, updateLibraryEntry);
router.patch('/:id/hide', protect, hideLibraryEntry);
router.patch('/:id/restore', protect, restoreLibraryEntry);
router.delete('/:id', protect, deleteLibraryEntry);

module.exports = router;
