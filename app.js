const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const telnyxRoutes = require('./src/routes/telnyx/telnyx.router');
const resendEmailRoutes = require('./src/routes/resend/resend.router');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'HR Backend Pipeline API',
    status: 'running',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/telnyx', telnyxRoutes);

app.use('/api/resend/reminders', resendEmailRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;

