const express = require('express');
const router = express.Router();
const { sendReminderEmail } = require('./resend.controller');

// GET route for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Resend reminders route is working',
    endpoint: 'POST /api/resend/reminders',
    requiredFields: ['to', 'Subject', 'from', 'body']
  });
});

router.post('/', sendReminderEmail);
router.post('/send', sendReminderEmail);

module.exports = router;

