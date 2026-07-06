const { query } = require('../config/database');

const UserModel = {
  /**
   * Create a new user.
   */
  async create({ username, email, passwordHash }) {
    const sql = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role, rating, problems_solved, created_at
    `;
    const { rows } = await query(sql, [username, email, passwordHash]);
    return rows[0];
  },

  /**
   * Find a user by email.
   */
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await query(sql, [email]);
    return rows[0] || null;
  },

  /**
   * Find a user by username.
   */
  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = $1`;
    const { rows } = await query(sql, [username]);
    return rows[0] || null;
  },

  /**
   * Find a user by ID (excludes password hash).
   */
  async findById(id) {
    const sql = `
      SELECT id, username, email, role, avatar_url, rating, problems_solved, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Update user profile fields.
   */
  async updateProfile(id, { username, email, avatarUrl }) {
    const sql = `
      UPDATE users
      SET username   = COALESCE($2, username),
          email      = COALESCE($3, email),
          avatar_url = COALESCE($4, avatar_url)
      WHERE id = $1
      RETURNING id, username, email, role, avatar_url, rating, problems_solved, updated_at
    `;
    const { rows } = await query(sql, [id, username, email, avatarUrl]);
    return rows[0] || null;
  },

  /**
   * Get paginated leaderboard sorted by rating.
   */
  async getLeaderboard(limit = 50, offset = 0) {
    const sql = `
      SELECT id, username, avatar_url, rating, problems_solved
      FROM users
      ORDER BY rating DESC, problems_solved DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await query(sql, [limit, offset]);
    return rows;
  },
};

module.exports = UserModel;
