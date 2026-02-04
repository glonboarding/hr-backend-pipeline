const { processTelnyxEvent, sendSMS, sendMMS } = require('./telnyx.service');

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

async function handleSendSMS(req, res) {
  try {
    // Preferred request shape:
    // { "to": "+1...", "from": "+1...", "text": "..." }
    // Back-compat: { "payload": { ... } }
    const body = req.body?.payload ? req.body.payload : req.body;

    const result = await sendSMS(body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Send SMS error:', err);
    const status = err.status || 500;
    const body = err.gatewayResponse || { ok: false, error: err.message };
    return res.status(status).json(body);
  }
}

async function handleSendMMS(req, res) {
  try {
    // Preferred request shape:
    // { "to": ["+1..."], "from": "+1...", "text": "...", "mediaUrls": ["https://..."] }
    // Back-compat: { "phoneNumbers": "...|[...]", "payload": { "from": "...", "message": "...", "media_urls": [...] } }
    const reqBody = req.body || {};
    const body = reqBody.payload ? reqBody.payload : reqBody;
    const to = reqBody.phoneNumbers ?? body.to;

    const result = await sendMMS(to, body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Send MMS error:', err);
    const status = err.status || 500;
    const body = err.gatewayResponse || { ok: false, error: err.message };
    return res.status(status).json(body);
  }
}

module.exports = { handleWebhook, handleSendSMS, handleSendMMS };

