-- Migration 007: Create contest junction tables
-- ==============================================

-- Links problems to contests with label + scoring
CREATE TABLE IF NOT EXISTS contest_problems (
    id           SERIAL PRIMARY KEY,
    contest_id   INTEGER     NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    problem_id   INTEGER     NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    label        VARCHAR(5)  NOT NULL,
    max_score    INTEGER     NOT NULL DEFAULT 100,
    order_index  INTEGER     NOT NULL DEFAULT 0,

    UNIQUE (contest_id, problem_id),
    UNIQUE (contest_id, label)
);

CREATE INDEX IF NOT EXISTS idx_contest_problems_contest
    ON contest_problems (contest_id, order_index);

-- Tracks user registration + scores per contest
CREATE TABLE IF NOT EXISTS contest_participants (
    id            SERIAL PRIMARY KEY,
    contest_id    INTEGER     NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score         INTEGER     NOT NULL DEFAULT 0,
    penalty       INTEGER     NOT NULL DEFAULT 0,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contest_participants_ranking
    ON contest_participants (contest_id, score DESC, penalty ASC);

CREATE INDEX IF NOT EXISTS idx_contest_participants_user
    ON contest_participants (user_id);
