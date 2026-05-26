const express = require('express');

const {
  getPlatformAdminDashboard,
  markFounderRequestContacted,
  saveFounderRequestNotes,
  provisionFounderRequest,
  resendFounderRequestInvite,
  suspendPlatformGym,
  reactivatePlatformGym,
  deactivatePlatformGym
} = require('../controllers/platformAdminController');
const { protect, requirePlatformAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requirePlatformAdmin);

router.get('/dashboard', getPlatformAdminDashboard);
router.post('/founder-requests/:id/contacted', markFounderRequestContacted);
router.patch('/founder-requests/:id/notes', saveFounderRequestNotes);
router.post('/founder-requests/:id/provision', provisionFounderRequest);
router.post('/founder-requests/:id/resend-invite', resendFounderRequestInvite);
router.post('/gyms/:id/suspend', suspendPlatformGym);
router.post('/gyms/:id/reactivate', reactivatePlatformGym);
router.post('/gyms/:id/deactivate', deactivatePlatformGym);

module.exports = router;
