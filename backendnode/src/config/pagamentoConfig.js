require('dotenv').config();

module.exports = {
  gatewayUrl: process.env.PAYMENT_GATEWAY_URL || 'https://api.paymentgateway.com/v1/payments',
  apiKey: process.env.PAYMENT_API_KEY,
  timeout: parseInt(process.env.PAYMENT_TIMEOUT) || 5000
};