import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../api/problems';
import DifficultyBadge from '../components/common/DifficultyBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

/* ── Demo data shown when backend is not connected ── */
const DEMO_PROBLEMS = [
  { id: 'demo-1', slug: 'two-sum', title: 'Two Sum', difficulty: 'easy', total_submissions: 15234, accepted_submissions: 8921 },
  { id: 'demo-2', slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'easy', total_submissions: 12456, accepted_submissions: 9102 },
  { id: 'demo-3', slug: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', total_submissions: 9876, accepted_submissions: 4532 },
  { id: 'demo-4', slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'medium', total_submissions: 7654, accepted_submissions: 3210 },
  { id: 'demo-5', slug: 'lru-cache', title: 'LRU Cache', difficulty: 'hard', total_submissions: 5432, accepted_submissions: 1234 },
  { id: 'demo-6', slug: 'binary-tree-max-path', title: 'Binary Tree Maximum Path Sum', difficulty: 'hard', total_submissions: 4321, accepted_submissions: 987 },
  { id: 'demo-7', slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'easy', total_submissions: 18765, accepted_submissions: 14321 },
  { id: 'demo-8', slug: 'coin-change', title: 'Coin Change', difficulty: 'medium', total_submissions: 8765, accepted_submissions: 3456 },
];

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.difficulty = filter;
    if (search) params.search = search;

    problemsAPI
      .getAll(params)
      .then((res) => {
        const apiProblems = res.data.data?.problems || [];
        if (apiProblems.length > 0) {
          setProblems(apiProblems);
          setUsingDemo(false);
        } else {
          // Show demo data when backend returns empty
          setProblems(DEMO_PROBLEMS);
          setUsingDemo(true);
        }
      })
      .catch(() => {
        // Backend is unreachable — show demo data
        setProblems(DEMO_PROBLEMS);
        setUsingDemo(true);
      })
      .finally(() => setLoading(false));
  }, [filter, search]);

  const filteredProblems = filter === 'all'
    ? problems
    : problems.filter((p) => p.difficulty === filter);

  const getAcceptanceRate = (total, accepted) => {
    if (!total) return '—';
    return ((accepted / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Problems</h1>
        <p>Sharpen your skills with curated coding challenges</p>
      </div>

      {usingDemo && (
        <div className="alert alert-info" style={{ marginBottom: '1rem', background: 'rgba(124, 106, 239, 0.1)', border: '1px solid rgba(124, 106, 239, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          ⚡ Showing demo problems. Connect the backend to see real data.
        </div>
      )}

      <div className="problem-filters">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`filter-btn ${filter === d ? 'active' : ''}`}
            onClick={() => setFilter(d)}
          >
            {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}

        <input
          className="form-input"
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', maxWidth: '250px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="problem-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Title</th>
                <th style={{ width: '120px' }}>Difficulty</th>
                <th style={{ width: '130px' }}>Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem, idx) => (
                <tr key={problem.id}>
                  <td className="problem-stats">{idx + 1}</td>
                  <td>
                    <Link
                      to={`/problems/${problem.slug}`}
                      className="problem-title"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                  <td className="problem-stats">
                    {getAcceptanceRate(problem.total_submissions, problem.accepted_submissions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProblems.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No problems found</h3>
              <p>Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
