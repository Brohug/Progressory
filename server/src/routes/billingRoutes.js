const express = require('express');

const {
  getBillingSubscription,
  getBillingStatus,
  getBillingAccessStatus,
  createCheckoutSession,
  createCustomerPortalSession
} = require('../controllers/billingController');
const { protect, requireManagement } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/access-status', protect, getBillingAccessStatus);
router.get('/subscription', protect, requireManagement, getBillingSubscription);
router.get('/status', protect, requireManagement, getBillingStatus);
router.post('/checkout-session', protect, requireManagement, createCheckoutSession);
router.post('/create-checkout-session', protect, requireManagement, createCheckoutSession);
router.post('/customer-portal', protect, requireManagement, createCustomerPortalSession);
router.post('/create-portal-session', protect, requireManagement, createCustomerPortalSession);

module.exports = router;
