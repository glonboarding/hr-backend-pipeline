const express = require('express');
const router = express.Router();
const { sendReminderEmail } = require('./resend.controller');

router.post('/send', sendReminderEmail);

module.exports = router;

