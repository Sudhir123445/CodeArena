const ContestModel = require('../models/contest.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const ContestController = {
  /**
   * GET /api/contests
   */
  async getAll(req, res, next) {
    try {
      const isAdmin = req.user?.role === 'admin';
      const contests = await ContestModel.getAll(!isAdmin);
      
      res.status(200).json({
        status: 'success',
        data: { contests },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/contests/:slug
   */
  async getBySlug(req, res, next) {
    try {
      const contest = await ContestModel.findBySlug(req.params.slug);
      if (!contest) throw new NotFoundError('Contest not found');

      const isStarted = new Date(contest.start_time) <= new Date();
      
      let isRegistered = false;
      let problems = [];

      if (req.user) {
        isRegistered = await ContestModel.isRegistered(contest.id, req.user.userId);
      }

      // Only show problems if contest started AND user is registered (or user is admin)
      if (isStarted && (isRegistered || req.user?.role === 'admin')) {
        problems = await ContestModel.getProblems(contest.id);
      }

      res.status(200).json({
        status: 'success',
        data: { 
          contest,
          isRegistered,
          problems
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/contests/:slug/register
   */
  async register(req, res, next) {
    try {
      const contest = await ContestModel.findBySlug(req.params.slug);
      if (!contest) throw new NotFoundError('Contest not found');

      // Check if contest ended
      if (new Date(contest.end_time) <= new Date()) {
        throw new BadRequestError('Contest has already ended');
      }

      await ContestModel.register(contest.id, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'Successfully registered for contest',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/contests/:slug/leaderboard
   */
  async getLeaderboard(req, res, next) {
    try {
      const contest = await ContestModel.findBySlug(req.params.slug);
      if (!contest) throw new NotFoundError('Contest not found');

      const leaderboard = await ContestModel.getLeaderboard(contest.id);

      res.status(200).json({
        status: 'success',
        data: { leaderboard },
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ContestController;
