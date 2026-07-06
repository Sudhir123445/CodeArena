const { query } = require('../config/database');

const ProblemModel = {
  /**
   * Create a new problem.
   */
  async create(data) {
    const {
      title,
      slug,
      statement_md,
      input_format,
      output_format,
      constraints_text,
      difficulty,
      time_limit_ms,
      memory_limit_kb,
      author_id,
      is_published,
    } = data;

    const sql = `
      INSERT INTO problems (
        title, slug, statement_md, input_format, output_format,
        constraints_text, difficulty, time_limit_ms, memory_limit_kb,
        author_id, is_published
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      title,
      slug,
      statement_md,
      input_format || null,
      output_format || null,
      constraints_text || null,
      difficulty || 'medium',
      time_limit_ms || 2000,
      memory_limit_kb || 262144,
      author_id || null,
      is_published || false,
    ];

    const { rows } = await query(sql, values);
    return rows[0];
  },

  /**
   * Get paginated problems.
   */
  async getAll(options = {}) {
    const { limit = 50, offset = 0, difficulty, is_published } = options;
    
    let sql = 'SELECT * FROM problems WHERE 1=1';
    const values = [];
    
    if (difficulty) {
      values.push(difficulty);
      sql += ` AND difficulty = $${values.length}`;
    }
    
    if (is_published !== undefined) {
      values.push(is_published);
      sql += ` AND is_published = $${values.length}`;
    }
    
    sql += ` ORDER BY id ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const { rows } = await query(sql, values);
    return rows;
  },

  /**
   * Find a problem by ID or Slug.
   */
  async findByIdOrSlug(identifier) {
    const isId = !isNaN(parseInt(identifier, 10));
    
    let sql;
    let values = [identifier];
    
    if (isId) {
      sql = `SELECT * FROM problems WHERE id = $1`;
    } else {
      sql = `SELECT * FROM problems WHERE slug = $1`;
    }
    
    const { rows } = await query(sql, values);
    return rows[0] || null;
  },

  /**
   * Update problem details.
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `
      UPDATE problems
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const { rows } = await query(sql, values);
    return rows[0] || null;
  },

  /**
   * Delete a problem.
   */
  async delete(id) {
    const sql = `DELETE FROM problems WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  },
};

module.exports = ProblemModel;
