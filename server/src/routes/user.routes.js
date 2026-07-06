const { Router } = require('express');
const { z } = require('zod');
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = Router();

// -- Validation schemas --

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

// -- Routes --

// Protected: current user
router.get('/me',  authenticate, UserController.getMe);
router.put('/me',  authenticate, validate(updateProfileSchema), UserController.updateMe);

// Public: view any user's profile
router.get('/:username', UserController.getProfile);

module.exports = router;
