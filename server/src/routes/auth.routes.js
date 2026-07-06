const { Router } = require('express');
const { z } = require('zod');
const AuthController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = Router();

// -- Validation schemas --

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// -- Routes --

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login',    validate(loginSchema),    AuthController.login);
router.post('/refresh',  validate(refreshSchema),  AuthController.refresh);
router.post('/logout',   authenticate,              AuthController.logout);

module.exports = router;
