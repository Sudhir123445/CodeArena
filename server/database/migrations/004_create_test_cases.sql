-- Migration 004: Create test_cases table
-- =======================================

CREATE TABLE IF NOT EXISTS test_cases (
    id              SERIAL PRIMARY KEY,
    problem_id      INTEGER      NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    input           TEXT         NOT NULL,
    expected_output TEXT         NOT NULL,
    is_sample       BOOLEAN      NOT NULL DEFAULT FALSE,
    order_index     INTEGER      NOT NULL DEFAULT 0,
    score_weight    INTEGER      NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_cases_problem   ON test_cases (problem_id, order_index);
CREATE INDEX IF NOT EXISTS idx_test_cases_sample    ON test_cases (problem_id, is_sample)
    WHERE is_sample = TRUE;
