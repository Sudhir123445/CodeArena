const { Pool } = require('pg');
const { env } = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT, 10),
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  logger.info('PostgreSQL client connected');
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL error', { error: err.message });
});

/**
 * Execute a SQL query against the pool.
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  logger.debug('Executed query', {
    text: text.substring(0, 100),
    duration: `${duration}ms`,
    rows: result.rowCount,
  });

  return result;
};

module.exports = { pool, query };
