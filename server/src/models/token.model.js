const { query } = require('../config/database');

const TokenModel = {
  /**
   * Store a hashed refresh token.
   */
  async createRefreshToken({ userId, tokenHash, expiresAt }) {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const { rows } = await query(sql, [userId, tokenHash, expiresAt]);
    return rows[0];
  },

  /**
   * Find a refresh token by its hash.
   */
  async findByTokenHash(tokenHash) {
    const sql = `
      SELECT * FROM refresh_tokens
      WHERE token_hash = $1 AND expires_at > NOW()
    `;
    const { rows } = await query(sql, [tokenHash]);
    return rows[0] || null;
  },

  /**
   * Delete a specific refresh token (logout).
   */
  async deleteByTokenHash(tokenHash) {
    const sql = `DELETE FROM refresh_tokens WHERE token_hash = $1`;
    await query(sql, [tokenHash]);
  },

  /**
   * Delete all refresh tokens for a user (logout all devices).
   */
  async deleteAllForUser(userId) {
    const sql = `DELETE FROM refresh_tokens WHERE user_id = $1`;
    await query(sql, [userId]);
  },

  /**
   * Clean up expired tokens.
   */
  async deleteExpired() {
    const sql = `DELETE FROM refresh_tokens WHERE expires_at <= NOW()`;
    const result = await query(sql);
    return result.rowCount;
  },
};

module.exports = TokenModel;
