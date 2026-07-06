const { Router } = require('express');
const { z } = require('zod');
const ProblemController = require('../controllers/problem.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = Router();

// Validation Schemas
const createProblemSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
  statement_md: z.string().min(10),
  input_format: z.string().optional(),
  output_format: z.string().optional(),
  constraints_text: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  time_limit_ms: z.number().int().positive().default(2000),
  memory_limit_kb: z.number().int().positive().default(262144),
  is_published: z.boolean().default(false),
});

const updateProblemSchema = createProblemSchema.partial();

// Public routes (with optional auth logic in controller to see unpublished ones)
// We add a dummy middleware to attach req.user if token exists without throwing 401 if it doesn't
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  // Use the normal authenticate logic, but ignore errors
  const jwt = require('jsonwebtoken');
  const { env } = require('../config/env');
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
  } catch (err) {
    // ignore
  }
  next();
};

router.get('/', optionalAuth, ProblemController.getAll);
router.get('/:identifier', optionalAuth, ProblemController.getById);

// Admin-only routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', validate(createProblemSchema), ProblemController.create);
router.put('/:id', validate(updateProblemSchema), ProblemController.update);
router.delete('/:id', ProblemController.delete);

module.exports = router;
