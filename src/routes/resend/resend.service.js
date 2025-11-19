const { emailQueue } = require('./emailQueue');

// Universal JSON format expected from n8n:
// {
//   "to": "email@example.com",
//   "Subject": "Email subject",
//   "from": "sender@example.com",
//   "body": "<html content>"
// }

async function sendReminderEmailService(data) {
  // Validate required fields
  if (!data.to) {
    throw new Error('Missing required field: to');
  }
  if (!data.Subject) {
    throw new Error('Missing required field: Subject');
  }
  if (!data.from) {
    throw new Error('Missing required field: from');
  }
  if (!data.body) {
    throw new Error('Missing required field: body');
  }

  // Normalize 'to' field - can be string or array
  const toEmails = Array.isArray(data.to) ? data.to : [data.to];

  // Prepare email payload for Resend
  const emailPayload = {
    from: data.from,
    to: toEmails,
    subject: data.Subject,
    html: data.body,
  };

  // Add email to queue and return a promise
  // The queue will process emails in FIFO order with rate limiting (2 per second)
  return new Promise((resolve, reject) => {
    emailQueue.enqueue(emailPayload, resolve, reject);
  });
}

module.exports = { sendReminderEmailService };

