-- Migration 005: Create contests table
-- =====================================

CREATE TYPE scoring_type AS ENUM ('icpc', 'ioi');

CREATE TABLE IF NOT EXISTS contests (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    description   TEXT,
    start_time    TIMESTAMPTZ  NOT NULL,
    end_time      TIMESTAMPTZ  NOT NULL,
    scoring       scoring_type NOT NULL DEFAULT 'icpc',
    is_published  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_contest_times CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contests_slug       ON contests (slug);
CREATE INDEX IF NOT EXISTS idx_contests_published   ON contests (is_published, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_contests_upcoming
ON contests (start_time);

CREATE TRIGGER set_contests_updated_at
    BEFORE UPDATE ON contests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
