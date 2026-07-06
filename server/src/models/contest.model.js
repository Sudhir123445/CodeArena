const { query } = require('../config/database');

const ContestModel = {
  async getAll(publishedOnly = true) {
    let sql = `SELECT id, title, slug, start_time, end_time, scoring, is_published FROM contests`;
    if (publishedOnly) {
      sql += ` WHERE is_published = TRUE`;
    }
    sql += ` ORDER BY start_time DESC`;
    const { rows } = await query(sql);
    return rows;
  },

  async findBySlug(slug) {
    const sql = `SELECT * FROM contests WHERE slug = $1`;
    const { rows } = await query(sql, [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const sql = `SELECT * FROM contests WHERE id = $1`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  async getProblems(contestId) {
    const sql = `
      SELECT cp.label, cp.max_score, cp.order_index, p.id, p.title, p.slug, p.difficulty
      FROM contest_problems cp
      JOIN problems p ON cp.problem_id = p.id
      WHERE cp.contest_id = $1
      ORDER BY cp.order_index ASC
    `;
    const { rows } = await query(sql, [contestId]);
    return rows;
  },

  async isRegistered(contestId, userId) {
    const sql = `SELECT 1 FROM contest_participants WHERE contest_id = $1 AND user_id = $2`;
    const { rows } = await query(sql, [contestId, userId]);
    return rows.length > 0;
  },

  async register(contestId, userId) {
    const sql = `
      INSERT INTO contest_participants (contest_id, user_id) 
      VALUES ($1, $2)
      ON CONFLICT (contest_id, user_id) DO NOTHING
      RETURNING *
    `;
    const { rows } = await query(sql, [contestId, userId]);
    return rows[0] || null; // Will be null if already registered
  },

  async getLeaderboard(contestId) {
    // This fetches users and their overall score/penalty.
    // In a real system we'd also join submissions to show individual problem statuses,
    // but we can compute that by joining `submissions` filtered by `contest_id` and grouping.
    const sql = `
      SELECT 
        cp.user_id, 
        u.username, 
        u.avatar_url, 
        cp.score, 
        cp.penalty,
        (
          SELECT json_agg(json_build_object(
            'problem_id', s.problem_id, 
            'verdict', s.verdict, 
            'submitted_at', s.submitted_at
          ))
          FROM submissions s
          WHERE s.contest_id = cp.contest_id AND s.user_id = cp.user_id
        ) as submissions_history
      FROM contest_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.contest_id = $1
      ORDER BY cp.score DESC, cp.penalty ASC
    `;
    const { rows } = await query(sql, [contestId]);
    return rows;
  }
};

module.exports = ContestModel;
