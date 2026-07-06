const { query } = require('../config/database');

const TestCaseModel = {
  async getByProblemId(problemId) {
    const sql = `SELECT id, input, expected_output as output, is_sample, score_weight FROM test_cases WHERE problem_id = $1 ORDER BY order_index ASC, id ASC`;
    const { rows } = await query(sql, [problemId]);
    return rows;
  },

  async create(data) {
    const { problem_id, input, expected_output, is_sample = false, order_index = 0, score_weight = 1 } = data;
    const sql = `
      INSERT INTO test_cases (problem_id, input, expected_output, is_sample, order_index, score_weight)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [problem_id, input, expected_output, is_sample, order_index, score_weight];
    const { rows } = await query(sql, values);
    return rows[0];
  },

  async delete(id) {
    const sql = `DELETE FROM test_cases WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }
};

module.exports = TestCaseModel;
