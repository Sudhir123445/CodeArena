const { Router } = require('express');
const { z } = require('zod');
const TestCaseController = require('../controllers/testcase.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = Router();

const createTestCaseSchema = z.object({
  problem_id: z.number().int().positive(),
  input: z.string(),
  expected_output: z.string(),
  is_sample: z.boolean().default(false),
  order_index: z.number().int().default(0),
  score_weight: z.number().int().positive().default(1),
});

// Admin-only routes
router.use(authenticate);
router.use(authorize('admin'));

router.get('/problem/:problemId', TestCaseController.getByProblem);
router.post('/', validate(createTestCaseSchema), TestCaseController.create);
router.delete('/:id', TestCaseController.delete);

module.exports = router;
