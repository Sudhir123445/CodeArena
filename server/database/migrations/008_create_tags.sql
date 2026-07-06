-- Migration 008: Create tags system
-- ==================================

CREATE TABLE IF NOT EXISTS tags (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS problem_tags (
    problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_problem_tags_tag
    ON problem_tags (tag_id);

-- Seed common competitive programming tags
INSERT INTO tags (name) VALUES
    ('arrays'),
    ('strings'),
    ('sorting'),
    ('binary-search'),
    ('two-pointers'),
    ('greedy'),
    ('dynamic-programming'),
    ('graphs'),
    ('trees'),
    ('math'),
    ('number-theory'),
    ('geometry'),
    ('bit-manipulation'),
    ('recursion'),
    ('backtracking'),
    ('divide-and-conquer'),
    ('hashing'),
    ('stack'),
    ('queue'),
    ('linked-list'),
    ('heap'),
    ('bfs'),
    ('dfs'),
    ('shortest-path'),
    ('mst'),
    ('segment-tree'),
    ('fenwick-tree'),
    ('trie'),
    ('union-find'),
    ('sliding-window')
ON CONFLICT (name) DO NOTHING;
