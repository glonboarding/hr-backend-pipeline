const { supabase } = require('../../config/supabase');

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

module.exports = { processTelnyxEvent };

