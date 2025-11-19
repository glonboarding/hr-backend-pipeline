const { sendReminderEmailService } = require('./resend.service');

async function sendReminderEmail(req, res) {
  try {
    const result = await sendReminderEmailService(req.body);

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Resend email error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { sendReminderEmail };

