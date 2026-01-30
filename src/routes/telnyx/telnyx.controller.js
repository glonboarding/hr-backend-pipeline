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
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing required field: payload' 
      });
    }

    const result = await sendSMS(payload);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Send SMS error:', err);
    return res.status(500).json({ 
      ok: false, 
      error: err.message 
    });
  }
}

async function handleSendMMS(req, res) {
  try {
    const { phoneNumbers, payload } = req.body;

    if (!phoneNumbers) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing required field: phoneNumbers' 
      });
    }

    if (!payload) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing required field: payload' 
      });
    }

    const result = await sendMMS(phoneNumbers, payload);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Send MMS error:', err);
    return res.status(500).json({ 
      ok: false, 
      error: err.message 
    });
  }
}

module.exports = { handleWebhook, handleSendSMS, handleSendMMS };

