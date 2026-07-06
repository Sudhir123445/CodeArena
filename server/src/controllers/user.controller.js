const UserModel = require('../models/user.model');
const { NotFoundError } = require('../utils/errors');

const UserController = {
  /**
   * GET /api/users/me — Get authenticated user's profile
   */
  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/users/me — Update authenticated user's profile
   */
  async updateMe(req, res, next) {
    try {
      const { username, email, avatarUrl } = req.body;
      const user = await UserModel.updateProfile(req.user.userId, {
        username,
        email,
        avatarUrl,
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({
        status: 'success',
        message: 'Profile updated',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/:username — Get public profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await UserModel.findByUsername(req.params.username);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Return only public fields
      const { password_hash, email, ...publicProfile } = user;

      res.status(200).json({
        status: 'success',
        data: { user: publicProfile },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/leaderboard — Rating leaderboard
   */
  async getLeaderboard(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
      const offset = (page - 1) * limit;

      const users = await UserModel.getLeaderboard(limit, offset);

      res.status(200).json({
        status: 'success',
        data: {
          users,
          pagination: { page, limit },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
