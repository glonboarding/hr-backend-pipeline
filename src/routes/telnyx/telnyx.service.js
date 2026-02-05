const { supabase } = require('../../config/supabase');
const { getGatewayConfig } = require('../../config/gateway');

async function processTelnyxEvent(body) {
  const payload = body?.data?.payload;
  if (!payload) return { handled: false };

  if (payload.type === 'SMS') {
    return await insertInboundSMS(payload);
  }

  return { handled: false, reason: 'type_not_supported', type: payload.type };
}

async function insertInboundSMS(payload) {
  const phoneNumber = payload.from.phone_number;
  const direction = phoneNumber === '+12014222696' ? 'outbound' : 'inbound';
  
  const { data, error } = await supabase
    .from('frontend_sms')
    .insert([
      {
        number: phoneNumber,
        message: payload.text,
        direction: direction,
        cost: payload?.cost_breakdown?.carrier_fee?.amount,
        seen: false,
      }
    ])
    .select();

  if (error) throw error;
  return data;
}

const DEFAULT_FROM = '+12014222696';

async function callGateway(endpoint, body) {
  const { baseUrl, token } = getGatewayConfig();
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || data.error || `Gateway returned ${response.status}`);
    err.status = response.status;
    err.gatewayResponse = data;
    throw err;
  }

  return data;
}

async function sendSMS(payload) {
  if (!payload || !payload.to || !payload.from || !payload.text) {
    throw new Error('Missing required fields: to, from, text');
  }

  const gatewayPayload = {
    to: payload.to,
    from: payload.from,
    text: payload.text,
    webhook_url: 'https://lapusteb.app.n8n.cloud/webhook/28310763-60a0-43a3-be53-2544aaa848f7',
    webhook_failover_url: 'https://lapusteb.app.n8n.cloud/webhook/28310763-60a0-43a3-be53-2544aaa848f7',
  };

  return callGateway('/sendSMS', gatewayPayload);
}

async function sendMMS(phoneNumbers, payload) {
  const to = phoneNumbers ?? payload?.to;
  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new Error('Missing required field: to (must be a string or non-empty array)');
  }

  if (!payload || !payload.from || !payload.text) {
    throw new Error('Missing required fields: from, text');
  }

  const toNumbers = Array.isArray(to) ? to : [to];

  if (!toNumbers.every((num) => typeof num === 'string' && num.trim().length > 0)) {
    throw new Error('All phone numbers must be non-empty strings');
  }

  // Single request to gateway with full to array (group message)
  const gatewayPayload = {
    to: toNumbers.map((n) => n.trim()),
    from: payload.from,
    text: payload.text,
    ...(payload.mediaUrls?.length > 0 || payload.media_urls?.length > 0
      ? { mediaUrls: payload.mediaUrls || payload.media_urls || [] }
      : {}),
  };

  return callGateway('/sendMMS', gatewayPayload);
}

module.exports = { processTelnyxEvent, sendSMS, sendMMS };

