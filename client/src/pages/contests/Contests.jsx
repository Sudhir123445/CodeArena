import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestsAPI } from '../../api/contests';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contestsAPI.getAll()
      .then(res => setContests(res.data.data.contests))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (now < startTime) return { label: 'Upcoming', color: 'var(--primary)' };
    if (now >= startTime && now <= endTime) return { label: 'Active', color: 'var(--verdict-ac)' };
    return { label: 'Ended', color: 'var(--text-muted)' };
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Contests</h1>
        <p>Compete against others in timed challenges.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}><LoadingSpinner /></div>
        ) : (
          <div className="table-responsive">
            <table className="submissions-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Start Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contests.map((c) => {
                  const status = getStatus(c.start_time, c.end_time);
                  const durationHrs = (new Date(c.end_time) - new Date(c.start_time)) / 3600000;
                  
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 'bold' }}>
                        <Link to={`/contests/${c.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {c.title}
                        </Link>
                      </td>
                      <td>{new Date(c.start_time).toLocaleString()}</td>
                      <td>{durationHrs} hrs</td>
                      <td style={{ color: status.color, fontWeight: 'bold' }}>{status.label}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/contests/${c.slug}`} className="btn btn-ghost btn-sm">Enter</Link>
                      </td>
                    </tr>
                  );
                })}
                {contests.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No contests available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
