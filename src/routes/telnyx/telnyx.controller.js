const { processTelnyxEvent } = require('./telnyx.service');

async function handleWebhook(req, res) {
  try {
    const result = await processTelnyxEvent(req.body);

    // Return 200 to prevent retries
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ ok: false });
  }
}

module.exports = { handleWebhook };

