const ProblemModel = require('../models/problem.model');
const { NotFoundError } = require('../utils/errors');

const ProblemController = {
  /**
   * GET /api/problems
   */
  async getAll(req, res, next) {
    try {
      const { difficulty, is_published, limit, offset } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
        difficulty,
      };

      if (is_published !== undefined) {
        options.is_published = is_published === 'true';
      }

      // If user is not admin, only show published problems
      if (!req.user || req.user.role !== 'admin') {
        options.is_published = true;
      }

      const problems = await ProblemModel.getAll(options);

      res.status(200).json({
        status: 'success',
        data: { problems },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/problems/:identifier
   */
  async getById(req, res, next) {
    try {
      const problem = await ProblemModel.findByIdOrSlug(req.params.identifier);

      if (!problem) {
        throw new NotFoundError('Problem not found');
      }

      // Hide unpublished problems from non-admins
      if (!problem.is_published && (!req.user || req.user.role !== 'admin')) {
        throw new NotFoundError('Problem not found');
      }

      res.status(200).json({
        status: 'success',
        data: { problem },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/problems
   * Admin only
   */
  async create(req, res, next) {
    try {
      const problemData = {
        ...req.body,
        author_id: req.user.userId,
      };

      const problem = await ProblemModel.create(problemData);

      res.status(201).json({
        status: 'success',
        message: 'Problem created successfully',
        data: { problem },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/problems/:id
   * Admin only
   */
  async update(req, res, next) {
    try {
      const problemId = parseInt(req.params.id, 10);
      const existing = await ProblemModel.findByIdOrSlug(problemId);

      if (!existing) {
        throw new NotFoundError('Problem not found');
      }

      const updatedProblem = await ProblemModel.update(problemId, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Problem updated successfully',
        data: { problem: updatedProblem },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/problems/:id
   * Admin only
   */
  async delete(req, res, next) {
    try {
      const problemId = parseInt(req.params.id, 10);
      const existing = await ProblemModel.findByIdOrSlug(problemId);

      if (!existing) {
        throw new NotFoundError('Problem not found');
      }

      await ProblemModel.delete(problemId);

      res.status(200).json({
        status: 'success',
        message: 'Problem deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProblemController;
