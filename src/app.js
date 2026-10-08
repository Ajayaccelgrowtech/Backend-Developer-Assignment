const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/environment');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { globalRateLimiter } = require('./middleware/rateLimiter.middleware');
const ApiError = require('./utils/apiError');

const app = express();

// Security Headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);

// Body Parsers & Logging
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (env.env !== 'test') {
  app.use(morgan(env.env === 'development' ? 'dev' : 'combined'));
}

// Rate Limiting
app.use('/api', globalRateLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CRM Sales Management System RESTful API',
    version: 'v1',
    documentation: 'See CRM_Sales_Management_System.postman_collection.json or README.md for endpoint details',
    healthCheck: '/health',
    apiBaseUrl: '/api/v1'
  });
});

// API Routes (flexible mounting for local server & Vercel serverless)
app.use('/api/v1', routes);
app.use('/v1', routes);
app.use('/api', routes);

// Handle Unknown Routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.originalUrl} on this server!`));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
