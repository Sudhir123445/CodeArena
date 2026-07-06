const { Router } = require('express');
const { z } = require('zod');
const SubmissionController = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = Router();

const createSubmissionSchema = z.object({
  problemId: z.union([z.number(), z.string()]),
  language: z.enum(['cpp', 'python', 'java', 'javascript']),
  sourceCode: z.string().min(1, 'Source code cannot be empty'),
});

// Internal callback for judge worker (should ideally be protected or internal only)
router.post('/internal/callback', SubmissionController.internalCallback);

// Require authentication to submit
router.post('/', authenticate, validate(createSubmissionSchema), SubmissionController.submit);

// Publicly readable (can be customized if we want private submissions later)
router.get('/', SubmissionController.getAll);
router.get('/:id', SubmissionController.getById);

module.exports = router;
