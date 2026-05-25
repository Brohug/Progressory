const express = require('express');

const {
  getPublicDemoSlots,
  createPublicInquiry
} = require('../controllers/publicInquiryController');
const { publicInquiryLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/demo-slots', publicInquiryLimiter, getPublicDemoSlots);
router.post('/', publicInquiryLimiter, createPublicInquiry);

module.exports = router;
