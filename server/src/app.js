const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

const app = express();

// ─── Global Middleware ───
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── API Routes ───
app.use('/api', routes);

// ─── 404 Handler ───
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// ─── Global Error Handler ───
app.use(errorHandler);

module.exports = app;
