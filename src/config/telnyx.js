const Telnyx = require('telnyx');

const telnyxApiKey = process.env.TELNYX_API_KEY;

if (!telnyxApiKey) {
  throw new Error('Missing Telnyx environment variable: TELNYX_API_KEY is required');
}

const telnyx = new Telnyx(telnyxApiKey);

module.exports = { telnyx };
