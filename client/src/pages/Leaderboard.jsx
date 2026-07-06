import { useState, useEffect } from 'react';
import { usersAPI } from '../api/users';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    usersAPI.getLeaderboard({ page, limit: 50 })
      .then(res => setUsers(res.data.data.users))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top coders ranked by contest rating and problems solved</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}><LoadingSpinner /></div>
        ) : (
          <div className="table-responsive">
            <table className="submissions-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Solved</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 'bold', color: index < 3 ? 'var(--primary)' : 'inherit' }}>
                        #{index + 1 + (page - 1) * 50}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '0.8rem'
                          }}>
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span style={{ fontWeight: '600' }}>{user.username}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{user.rating}</td>
                      <td>{user.problems_solved}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
