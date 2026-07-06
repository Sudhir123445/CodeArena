import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestsAPI } from '../../api/contests';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ContestScoreboard() {
  const { slug } = useParams();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contestsAPI.getLeaderboard(slug)
      .then(res => setBoard(res.data.data.leaderboard))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Scoreboard</h1>
          <p>Live rankings for the contest</p>
        </div>
        <Link to={`/contests/${slug}`} className="btn btn-ghost">
          &larr; Back to Contest
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="submissions-table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Participant</th>
                <th>Score</th>
                <th>Penalty (min)</th>
              </tr>
            </thead>
            <tbody>
              {board.map((row, index) => (
                <tr key={row.user_id}>
                  <td style={{ fontWeight: 'bold' }}>#{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', 
                        background: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '0.7rem'
                      }}>
                        {row.avatar_url ? (
                          <img src={row.avatar_url} alt={row.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                          row.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span style={{ fontWeight: '600' }}>{row.username}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold', color: row.score > 0 ? 'var(--verdict-ac)' : 'inherit' }}>
                    {row.score}
                  </td>
                  <td className="mono">{row.penalty}</td>
                </tr>
              ))}
              {board.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No participants yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
