const express = require('express');
const router = express.Router();
const { handleWebhook } = require('./telnyx.controller');

router.post(
  '/webhook/:id', 
  handleWebhook
);

module.exports = router;

