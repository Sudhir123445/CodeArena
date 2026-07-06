const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');
const UserModel = require('../models/user.model');
const TokenModel = require('../models/token.model');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} = require('../utils/errors');

const SALT_ROUNDS = 12;

const AuthService = {
  /**
   * Register a new user.
   */
  async register({ username, email, password }) {
    // Check for existing user
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Email is already registered');
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserModel.create({ username, email, passwordHash });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  },

  /**
   * Authenticate user with email/password.
   */
  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return user without password hash
    const { password_hash, ...safeUser } = user;

    return { user: safeUser, ...tokens };
  },

  /**
   * Refresh the access token using a valid refresh token.
   */
  async refreshToken(refreshToken) {
    // Verify JWT signature
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Verify token exists in database
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const stored = await TokenModel.findByTokenHash(tokenHash);
    if (!stored) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // Get user
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    // Rotate: delete old token, issue new pair
    await TokenModel.deleteByTokenHash(tokenHash);
    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  },

  /**
   * Logout — revoke a refresh token.
   */
  async logout(refreshToken) {
    if (!refreshToken) return;

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await TokenModel.deleteByTokenHash(tokenHash);
  },

  /**
   * Generate access + refresh token pair.
   */
  async generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    // Store hashed refresh token in DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + this.parseDuration(env.JWT_REFRESH_EXPIRES_IN)
    );

    await TokenModel.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  },

  /**
   * Parse duration string (e.g., '7d', '15m', '1h') to milliseconds.
   */
  parseDuration(str) {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return 86400000; // Default 1 day
    return parseInt(match[1], 10) * units[match[2]];
  },
};

module.exports = AuthService;
