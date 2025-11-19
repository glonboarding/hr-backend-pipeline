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

  // TODO: Initialize Resend client when package is installed
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // const result = await resend.emails.send(emailPayload);

  // For now, return the formatted payload
  // Replace this with actual Resend API call when package is installed
  return {
    message: 'Email formatted successfully',
    emailPayload,
    // When Resend is integrated, return: result
  };
}

module.exports = { sendReminderEmailService };

