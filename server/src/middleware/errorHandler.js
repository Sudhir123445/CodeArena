const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handling middleware.
 * Must be registered after all routes.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Known operational errors
  if (err instanceof AppError) {
    logger.warn(`${statusCode} ${req.method} ${req.originalUrl}: ${message}`);
  } else {
    // Unknown / programming errors — log full stack
    logger.error('Unhandled error', {
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });

    // Don't leak internals in production
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error';
    }
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
