const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error('Missing Resend environment variable: RESEND_API_KEY is required');
}

const resend = new Resend(resendApiKey);

module.exports = { resend };

