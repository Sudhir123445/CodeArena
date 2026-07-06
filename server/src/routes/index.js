const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const UserController = require('../controllers/user.controller');
const problemRoutes = require('./problem.routes');
const submissionRoutes = require('./submission.routes');
const testcaseRoutes = require('./testcase.routes');
const contestRoutes = require('./contest.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/testcases', testcaseRoutes);
router.use('/contests', contestRoutes);

// Standalone routes
router.get('/leaderboard', UserController.getLeaderboard);

module.exports = router;
