import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submissionsAPI } from '../api/submissions';
import VerdictBadge from '../components/common/VerdictBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DEMO_SUBMISSIONS = [
  { id: 'a1b2c3', problem_title: 'Two Sum', problem_slug: 'two-sum', language: 'cpp', verdict: 'AC', runtime_ms: 12, memory_kb: 3400, submitted_at: '2026-06-24T10:30:00Z' },
  { id: 'd4e5f6', problem_title: 'Merge Intervals', problem_slug: 'merge-intervals', language: 'python', verdict: 'WA', runtime_ms: 45, memory_kb: 8200, submitted_at: '2026-06-24T10:15:00Z' },
  { id: 'g7h8i9', problem_title: 'LRU Cache', problem_slug: 'lru-cache', language: 'java', verdict: 'TLE', runtime_ms: 2001, memory_kb: 15600, submitted_at: '2026-06-24T09:45:00Z' },
  { id: 'j1k2l3', problem_title: 'Valid Parentheses', problem_slug: 'valid-parentheses', language: 'cpp', verdict: 'AC', runtime_ms: 4, memory_kb: 2100, submitted_at: '2026-06-23T20:00:00Z' },
  { id: 'm4n5o6', problem_title: 'Coin Change', problem_slug: 'coin-change', language: 'python', verdict: 'RTE', runtime_ms: null, memory_kb: null, submitted_at: '2026-06-23T18:30:00Z' },
  { id: 'p7q8r9', problem_title: 'Binary Tree Maximum Path Sum', problem_slug: 'binary-tree-max-path', language: 'cpp', verdict: 'CE', runtime_ms: null, memory_kb: null, submitted_at: '2026-06-23T17:00:00Z' },
];

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsAPI
      .getAll()
      .then((res) => setSubmissions(res.data.data?.submissions || []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  const displaySubmissions = submissions.length > 0 ? submissions : DEMO_SUBMISSIONS;

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>My Submissions</h1>
        <p>Track your submission history and verdicts</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Language</th>
              <th>Verdict</th>
              <th>Time</th>
              <th>Memory</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {displaySubmissions.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <Link
                    to={`/problems/${sub.problem_slug}`}
                    className="problem-title"
                  >
                    {sub.problem_title}
                  </Link>
                </td>
                <td className="mono">{sub.language}</td>
                <td>
                  <VerdictBadge verdict={sub.verdict} />
                </td>
                <td className="mono">
                  {sub.runtime_ms != null ? `${sub.runtime_ms}ms` : '—'}
                </td>
                <td className="mono">
                  {sub.memory_kb != null ? `${(sub.memory_kb / 1024).toFixed(1)}MB` : '—'}
                </td>
                <td className="mono">{formatTime(sub.submitted_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {displaySubmissions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No submissions yet</h3>
            <p>Start solving problems to see your submissions here</p>
          </div>
        )}
      </div>
    </div>
  );
}
