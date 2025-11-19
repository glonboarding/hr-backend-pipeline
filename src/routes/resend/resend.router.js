const express = require('express');
const router = express.Router();
const { sendReminderEmail } = require('./resend.controller');
const { emailQueue } = require('./emailQueue');

// GET route for testing and queue status
router.get('/', (req, res) => {
  const status = emailQueue.getStatus();
  res.json({ 
    message: 'Resend reminders route is working',
    endpoint: 'POST /api/resend/reminders',
    requiredFields: ['to', 'Subject', 'from', 'body'],
    queueStatus: status
  });
});

router.post('/', sendReminderEmail);
router.post('/send', sendReminderEmail);

module.exports = router;

