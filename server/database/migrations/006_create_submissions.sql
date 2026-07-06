-- Migration 006: Create submissions table
-- ========================================

CREATE TYPE verdict_type AS ENUM (
    'pending', 'queued', 'compiling', 'running',
    'AC', 'WA', 'TLE', 'MLE', 'RTE', 'CE', 'SE'
);

CREATE TABLE IF NOT EXISTS submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id      INTEGER      NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    contest_id      INTEGER      REFERENCES contests(id) ON DELETE SET NULL,
    source_code     TEXT         NOT NULL,
    language        VARCHAR(20)  NOT NULL,
    verdict         verdict_type NOT NULL DEFAULT 'pending',
    runtime_ms      INTEGER,
    memory_kb       INTEGER,
    score           INTEGER      NOT NULL DEFAULT 0,
    test_results    JSONB,
    submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ===========================================
-- Primary query indexes
-- ===========================================

-- User's submission history (profile page, "my submissions")
CREATE INDEX IF NOT EXISTS idx_submissions_user_time
    ON submissions (user_id, submitted_at DESC);

-- Problem submissions feed (problem page, admin stats)
CREATE INDEX IF NOT EXISTS idx_submissions_problem_verdict
    ON submissions (problem_id, verdict, submitted_at DESC);

-- Contest-scoped submissions (scoreboard calculation)
CREATE INDEX IF NOT EXISTS idx_submissions_contest_user
    ON submissions (contest_id, user_id, problem_id, submitted_at DESC)
    WHERE contest_id IS NOT NULL;

-- ===========================================
-- Operational indexes
-- ===========================================

-- Judge queue: quickly find pending work
CREATE INDEX IF NOT EXISTS idx_submissions_pending
    ON submissions (submitted_at ASC)
    WHERE verdict IN ('pending', 'queued');

-- Language analytics
CREATE INDEX IF NOT EXISTS idx_submissions_language
    ON submissions (language);

-- JSONB: find submissions that contain a specific test verdict
CREATE INDEX IF NOT EXISTS idx_submissions_results_gin
    ON submissions USING GIN (test_results jsonb_path_ops);
