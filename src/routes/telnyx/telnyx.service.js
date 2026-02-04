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
  if (!payload || (!payload.message && !payload.text)) {
    throw new Error('Missing required field: message or text in payload');
  }

  const gatewayPayload = {
    to: payload.to || payload.recipient || DEFAULT_FROM,
    from: payload.from || DEFAULT_FROM,
    text: payload.text || payload.message,
  };

  return callGateway('/sendSMS', gatewayPayload);
}

async function sendMMS(phoneNumbers, payload) {
  if (!phoneNumbers || (Array.isArray(phoneNumbers) && phoneNumbers.length === 0)) {
    throw new Error('Missing required field: phoneNumbers (must be a string or non-empty array)');
  }

  if (!payload || (!payload.message && !payload.text)) {
    throw new Error('Missing required field: message or text in payload');
  }

  const toNumbers = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

  if (!toNumbers.every((num) => typeof num === 'string' && num.trim().length > 0)) {
    throw new Error('All phone numbers must be non-empty strings');
  }

  const results = await Promise.all(
    toNumbers.map(async (phoneNumber) => {
      try {
        const gatewayPayload = {
          to: phoneNumber.trim(),
          from: payload.from || DEFAULT_FROM,
          text: payload.text || payload.message,
          mediaUrls: payload.mediaUrls || payload.media_urls || [],
        };
        const data = await callGateway('/sendMMS', gatewayPayload);
        return { success: true, to: phoneNumber.trim(), ...data };
      } catch (error) {
        console.error(`Gateway MMS error for ${phoneNumber}:`, error);
        return {
          success: false,
          to: phoneNumber.trim(),
          error: error.message,
          ...(error.gatewayResponse && { gatewayResponse: error.gatewayResponse }),
        };
      }
    })
  );

  return {
    results,
    totalSent: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
  };
}

module.exports = { processTelnyxEvent, sendSMS, sendMMS };

