require('dotenv').config();
const app = require('./app');

// Export app for Vercel serverless (Vercel will use this as the handler)
module.exports = app;

// For local development, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
