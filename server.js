require('dotenv').config();
const app = require('./app');

// Export app for Vercel serverless
module.exports = app;

// For local development, start the server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
