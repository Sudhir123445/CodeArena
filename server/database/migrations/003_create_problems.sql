-- Migration 003: Create problems table
-- =====================================

CREATE TABLE IF NOT EXISTS problems (
    id                SERIAL PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL UNIQUE,
    statement_md      TEXT         NOT NULL,
    input_format      TEXT,
    output_format     TEXT,
    constraints_text  TEXT,
    difficulty        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                      CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_limit_ms     INTEGER      NOT NULL DEFAULT 2000,
    memory_limit_kb   INTEGER      NOT NULL DEFAULT 262144,
    author_id         UUID         REFERENCES users(id) ON DELETE SET NULL,
    is_published      BOOLEAN      NOT NULL DEFAULT FALSE,
    total_submissions    INTEGER   NOT NULL DEFAULT 0,
    accepted_submissions INTEGER   NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_problems_slug        ON problems (slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty   ON problems (difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_author       ON problems (author_id);
CREATE INDEX IF NOT EXISTS idx_problems_published    ON problems (is_published, id DESC);

-- Reuse the updated_at trigger function from migration 001
CREATE TRIGGER set_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
