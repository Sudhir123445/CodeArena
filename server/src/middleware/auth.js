const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Middleware: Verify JWT access token from Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired'));
    }
    return next(new UnauthorizedError('Invalid access token'));
  }
};

/**
 * Middleware factory: Restrict access to specific roles.
 * Must be used after `authenticate`.
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'moderator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Middleware: Verify JWT if present, otherwise proceed unauthenticated.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (err) {
    // Ignore errors for optional auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
