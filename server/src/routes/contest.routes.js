const { Router } = require('express');
const ContestController = require('../controllers/contest.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Public / Optional Auth routes
router.get('/', ContestController.getAll);
router.get('/:slug', ContestController.getBySlug);
router.get('/:slug/leaderboard', ContestController.getLeaderboard);

// Protected routes
router.post('/:slug/register', authenticate, ContestController.register);

module.exports = router;
