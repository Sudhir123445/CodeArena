const { query } = require('../config/database');

const SubmissionModel = {
  /**
   * Create a new submission.
   */
  async create(data) {
    const { user_id, problem_id, contest_id = null, language, source_code, verdict = 'pending' } = data;

    const sql = `
      INSERT INTO submissions (user_id, problem_id, contest_id, language, source_code, verdict)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, verdict, submitted_at as created_at
    `;

    const values = [user_id, problem_id, contest_id, language, source_code, verdict];

    const { rows } = await query(sql, values);
    return rows[0];
  },

  /**
   * Find a submission by ID.
   */
  async findById(id) {
    const sql = `
      SELECT s.*, u.username, p.title as problem_title 
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.id = $1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Get paginated submissions.
   */
  async getAll(options = {}) {
    const { limit = 50, offset = 0, user_id, problem_id } = options;
    
    let sql = `
      SELECT s.id, s.user_id, s.problem_id, s.language, s.verdict, 
             s.runtime_ms, s.memory_kb, s.submitted_at,
             u.username, p.title as problem_title, p.slug as problem_slug
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE 1=1
    `;
    
    const values = [];
    
    if (user_id) {
      values.push(user_id);
      sql += ` AND s.user_id = $${values.length}`;
    }
    
    if (problem_id) {
      values.push(problem_id);
      sql += ` AND s.problem_id = $${values.length}`;
    }
    
    sql += ` ORDER BY s.submitted_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const { rows } = await query(sql, values);
    return rows;
  },

  /**
   * Update submission verdict after judging.
   */
  async updateVerdict(id, verdict, runtime_ms = null, memory_kb = null, test_results = null) {
    const sql = `
      UPDATE submissions
      SET verdict = $2, runtime_ms = $3, memory_kb = $4, test_results = $5
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await query(sql, [id, verdict, runtime_ms, memory_kb, test_results]);
    return rows[0] || null;
  }
};

module.exports = SubmissionModel;
