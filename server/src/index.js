require('dotenv').config();

const app = require('./app');
const { env } = require('./config/env');
const { pool } = require('./config/database');
const logger = require('./utils/logger');

const PORT = parseInt(env.PORT, 10);

async function start() {
  // Verify database connectivity
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info(`PostgreSQL connected: ${result.rows[0].now}`);
  } catch (err) {
    logger.error('Failed to connect to PostgreSQL', {
      error: err.message || err.code || String(err),
    });
    process.exit(1);
  }

  // Start HTTP server
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📋 Environment: ${env.NODE_ENV}`);
  });
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

start();
