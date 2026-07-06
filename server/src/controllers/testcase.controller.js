const TestCaseModel = require('../models/testcase.model');
const ProblemModel = require('../models/problem.model');
const { NotFoundError } = require('../utils/errors');

const TestCaseController = {
  /**
   * GET /api/testcases/problem/:problemId
   */
  async getByProblem(req, res, next) {
    try {
      const problemId = parseInt(req.params.problemId, 10);
      const testCases = await TestCaseModel.getByProblemId(problemId);

      res.status(200).json({
        status: 'success',
        data: { testCases },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/testcases
   */
  async create(req, res, next) {
    try {
      const problem = await ProblemModel.findByIdOrSlug(req.body.problem_id);
      if (!problem) {
        throw new NotFoundError('Problem not found');
      }

      const testCase = await TestCaseModel.create(req.body);

      res.status(201).json({
        status: 'success',
        message: 'Test case added successfully',
        data: { testCase },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/testcases/:id
   */
  async delete(req, res, next) {
    try {
      const testCaseId = parseInt(req.params.id, 10);
      const deleted = await TestCaseModel.delete(testCaseId);

      if (!deleted) {
        throw new NotFoundError('Test case not found');
      }

      res.status(200).json({
        status: 'success',
        message: 'Test case deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TestCaseController;
