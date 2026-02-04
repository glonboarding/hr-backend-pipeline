const GATEWAY_BASE_URL = 'https://6rlefrfozc.execute-api.us-east-1.amazonaws.com';
const INTERNAL_GATEWAY_TOKEN = process.env.INTERNAL_GATEWAY_TOKEN;

function getGatewayConfig() {
  if (!INTERNAL_GATEWAY_TOKEN) {
    throw new Error('Missing required environment variable: INTERNAL_GATEWAY_TOKEN');
  }
  return {
    baseUrl: GATEWAY_BASE_URL,
    token: INTERNAL_GATEWAY_TOKEN,
  };
}

module.exports = { getGatewayConfig, GATEWAY_BASE_URL };
