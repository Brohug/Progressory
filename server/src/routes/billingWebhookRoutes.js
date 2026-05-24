const express = require('express');

const { handleBillingWebhook } = require('../controllers/billingController');

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), handleBillingWebhook);

module.exports = router;
