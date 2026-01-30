const express = require('express');
const router = express.Router();
const { handleWebhook, handleSendSMS, handleSendMMS } = require('./telnyx.controller');

router.post(
  '/webhook/:id', 
  handleWebhook
);

// Send SMS route - requires payload with message
router.post('/sendSMS', handleSendSMS);

// Send MMS route - requires phoneNumbers (string or array) and payload with message
router.post('/sendMMS', handleSendMMS);

module.exports = router;

