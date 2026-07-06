const SubmissionModel = require('../models/submission.model');
const ProblemModel = require('../models/problem.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const SubmissionController = {
  /**
   * POST /api/submissions
   */
  async submit(req, res, next) {
    try {
      const { problemId, language, sourceCode, contestId } = req.body;
      const userId = req.user.userId;

      // Verify the problem exists
      const problem = await ProblemModel.findByIdOrSlug(problemId);
      if (!problem) {
        throw new NotFoundError('Problem not found');
      }

      // Hide unpublished problems from non-admins
      if (!problem.is_published && req.user.role !== 'admin') {
        throw new NotFoundError('Problem not found');
      }

      // Fetch test cases
      const TestCaseModel = require('../models/testcase.model');
      const testCases = await TestCaseModel.getByProblemId(problem.id);
      
      // If there are no test cases, we could theoretically skip or error, but let's pass empty array.
      
      // Create submission
      const submission = await SubmissionModel.create({
        user_id: userId,
        problem_id: problem.id,
        contest_id: contestId || null,
        language,
        source_code: sourceCode,
        verdict: 'pending',
      });

      // Call Judge Worker
      try {
        const judgeUrl = process.env.JUDGE_WORKER_URL || 'http://localhost:5001';
        await fetch(`${judgeUrl}/judge`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             submissionId: submission.id,
             language,
             sourceCode,
             timeLimitMs: problem.time_limit_ms,
             memoryLimitKb: problem.memory_limit_kb,
             testCases
           })
        });
      } catch (err) {
        console.error('Failed to contact judge worker:', err.message);
        // We do not fail the request, the submission remains 'Pending' and could be retried by a cron job later.
      }

      res.status(201).json({
        status: 'success',
        message: 'Submission received successfully',
        data: { submissionId: submission.id, verdict: submission.verdict },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/submissions/internal/callback
   */
  async internalCallback(req, res, next) {
    try {
      const { submissionId, verdict, timeMs, memoryKb, results } = req.body;
      
      const updatedSub = await SubmissionModel.updateVerdict(
        submissionId, 
        verdict, 
        timeMs, 
        memoryKb, 
        JSON.stringify(results)
      );

      // ICPC Scoring Logic
      if (updatedSub && updatedSub.contest_id) {
        const { query } = require('../config/database');
        const contestRes = await query('SELECT start_time FROM contests WHERE id = $1', [updatedSub.contest_id]);
        
        if (contestRes.rowCount > 0) {
          const startTime = new Date(contestRes.rows[0].start_time);
          const submittedAt = new Date(updatedSub.submitted_at || new Date());
          const minutesFromStart = Math.floor((submittedAt - startTime) / 60000);

          // Get all submissions by this user for this problem in this contest BEFORE this one
          const prevSubs = await query(`
            SELECT verdict FROM submissions 
            WHERE contest_id = $1 AND user_id = $2 AND problem_id = $3 AND submitted_at < $4
            ORDER BY submitted_at ASC
          `, [updatedSub.contest_id, updatedSub.user_id, updatedSub.problem_id, updatedSub.submitted_at]);

          // Has user already solved it before? If so, ignore.
          const alreadySolved = prevSubs.rows.some(s => s.verdict === 'AC');

          if (!alreadySolved && verdict === 'AC') {
            // Count wrong tries
            let wrongTries = 0;
            for (const s of prevSubs.rows) {
              if (s.verdict !== 'CE') wrongTries++; // CE usually doesn't count for penalty
            }
            
            const penaltyToAdd = minutesFromStart + (wrongTries * 20);

            await query(`
              UPDATE contest_participants
              SET score = score + 1, penalty = penalty + $3
              WHERE contest_id = $1 AND user_id = $2
            `, [updatedSub.contest_id, updatedSub.user_id, penaltyToAdd]);
          }
        }
      }

      // Update global problem stats
      if (updatedSub) {
         const { query } = require('../config/database');
         await query(`
           UPDATE problems 
           SET total_submissions = total_submissions + 1,
               accepted_submissions = accepted_submissions + CASE WHEN $2 = 'AC' THEN 1 ELSE 0 END
           WHERE id = $1
         `, [updatedSub.problem_id, verdict]);
      }
      
      res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/submissions/:id
   */
  async getById(req, res, next) {
    try {
      const submission = await SubmissionModel.findById(req.params.id);

      if (!submission) {
        throw new NotFoundError('Submission not found');
      }

      res.status(200).json({
        status: 'success',
        data: { submission },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/submissions
   */
  async getAll(req, res, next) {
    try {
      const { user_id, problem_id, limit, offset } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
        user_id,
        problem_id,
      };

      const submissions = await SubmissionModel.getAll(options);

      res.status(200).json({
        status: 'success',
        data: { submissions },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SubmissionController;
