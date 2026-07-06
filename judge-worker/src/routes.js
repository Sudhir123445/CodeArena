const { Router } = require('express');
const { runSubmission } = require('./runner');

const router = Router();

router.post('/judge', async (req, res) => {
  try {
    const { submissionId, language, sourceCode, timeLimitMs, memoryLimitKb, testCases } = req.body;
    
    if (!submissionId || !language || !sourceCode || !testCases) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Acknowledge receipt
    res.status(202).json({ message: 'Judging started' });

    // Run asynchronously
    // In a real system, we'd update the DB via the main backend API or direct DB connection here.
    // For this microservice, we will simulate the callback by logging for now, or making an HTTP call back to the main API.
    // The main API will need a webhook endpoint: POST /api/submissions/callback
    const result = await runSubmission(submissionId, language, sourceCode, timeLimitMs, memoryLimitKb, testCases);
    
    // Callback to main backend
    const axios = require('axios'); // We need to install axios in worker or use fetch
    try {
      await fetch('http://localhost:5000/api/submissions/internal/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          verdict: result.verdict,
          timeMs: result.timeMs,
          memoryKb: result.memoryKb,
          results: result.results || [],
          message: result.message
        })
      });
    } catch (cbErr) {
      console.error('Failed to send callback to main server', cbErr.message);
    }

  } catch (err) {
    console.error('Judge error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

module.exports = router;
