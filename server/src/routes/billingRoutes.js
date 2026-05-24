const express = require('express');

const {
  getBillingSubscription,
  getBillingAccessStatus,
  createCheckoutSession,
  createCustomerPortalSession
} = require('../controllers/billingController');
const { protect, requireOwner } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/access-status', protect, getBillingAccessStatus);
router.get('/subscription', protect, requireOwner, getBillingSubscription);
router.post('/checkout-session', protect, requireOwner, createCheckoutSession);
router.post('/customer-portal', protect, requireOwner, createCustomerPortalSession);

module.exports = router;
