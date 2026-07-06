import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { submissionsAPI } from '../api/submissions';
import VerdictBadge from '../components/common/VerdictBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Profile() {
  const { user } = useAuth();
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsAPI
      .getAll({ limit: 5 })
      .then((res) => setRecentSubmissions(res.data.data?.submissions || []))
      .catch(() => setRecentSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <LoadingSpinner />;

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  // Demo recent submissions when API isn't connected
  const displayRecent = recentSubmissions.length > 0 ? recentSubmissions : [
    { id: '1', problem_title: 'Two Sum', verdict: 'AC', language: 'cpp', submitted_at: '2026-06-24T10:30:00Z' },
    { id: '2', problem_title: 'Merge Intervals', verdict: 'WA', language: 'python', submitted_at: '2026-06-24T09:00:00Z' },
    { id: '3', problem_title: 'Valid Parentheses', verdict: 'AC', language: 'cpp', submitted_at: '2026-06-23T20:00:00Z' },
  ];

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-page">
        {/* Left: Profile Card */}
        <div className="card profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">{user.username}</div>
          <div className="profile-email">{user.email}</div>

          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-value">{user.problems_solved || 0}</div>
              <div className="stat-label">Solved</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{user.rating || 0}</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="stat-box" style={{ textAlign: 'left' }}>
              <div className="stat-label">Member Since</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity */}
        <div>
          <div className="card profile-activity">
            <h2>Recent Submissions</h2>

            {loading ? (
              <LoadingSpinner />
            ) : displayRecent.length === 0 ? (
              <div className="empty-state">
                <p>No submissions yet</p>
              </div>
            ) : (
              <table className="submissions-table" style={{ marginTop: '0.5rem' }}>
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Verdict</th>
                    <th>Language</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecent.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>{sub.problem_title}</td>
                      <td><VerdictBadge verdict={sub.verdict} /></td>
                      <td className="mono">{sub.language}</td>
                      <td className="mono">{formatTime(sub.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
