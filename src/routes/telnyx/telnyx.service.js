const { supabase } = require('../../config/supabase');
const { telnyx } = require('../../config/telnyx');

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

// Hardcoded phone numbers
const SENDING_PHONE_NUMBER = '+12014222696'; // Phone number to send from
const RECIPIENT_PHONE_NUMBER = '+12014222696'; // Hardcoded recipient phone number for SMS

async function sendSMS(payload) {
  if (!payload || !payload.message) {
    throw new Error('Missing required field: message in payload');
  }

  try {
    const message = await telnyx.messages.create({
      from: SENDING_PHONE_NUMBER,
      to: RECIPIENT_PHONE_NUMBER,
      text: payload.message,
      ...payload // Allow other payload fields to be passed through
    });

    return {
      success: true,
      messageId: message.data.id,
      to: RECIPIENT_PHONE_NUMBER,
      message: payload.message
    };
  } catch (error) {
    console.error('Telnyx SMS error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

async function sendMMS(phoneNumbers, payload) {
  if (!phoneNumbers || (Array.isArray(phoneNumbers) && phoneNumbers.length === 0)) {
    throw new Error('Missing required field: phoneNumbers (must be a string or non-empty array)');
  }

  if (!payload || !payload.message) {
    throw new Error('Missing required field: message in payload');
  }

  // Normalize phoneNumbers to array
  const toNumbers = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];
  
  // Validate all phone numbers are strings
  if (!toNumbers.every(num => typeof num === 'string' && num.trim().length > 0)) {
    throw new Error('All phone numbers must be non-empty strings');
  }

  try {
    // Send MMS to each phone number
    const results = await Promise.all(
      toNumbers.map(async (phoneNumber) => {
        try {
          const message = await telnyx.messages.create({
            from: SENDING_PHONE_NUMBER,
            to: phoneNumber.trim(),
            text: payload.message,
            media_urls: payload.media_urls || [], // MMS media URLs
            ...payload // Allow other payload fields to be passed through
          });

          return {
            success: true,
            messageId: message.data.id,
            to: phoneNumber.trim(),
            message: payload.message
          };
        } catch (error) {
          console.error(`Telnyx MMS error for ${phoneNumber}:`, error);
          return {
            success: false,
            to: phoneNumber.trim(),
            error: error.message
          };
        }
      })
    );

    return {
      success: true,
      results: results,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Telnyx MMS error:', error);
    throw new Error(`Failed to send MMS: ${error.message}`);
  }
}

module.exports = { processTelnyxEvent, sendSMS, sendMMS };

