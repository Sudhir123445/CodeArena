import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contestsAPI } from '../../api/contests';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ContestDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [contest, setContest] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchContest();
  }, [slug]);

  const fetchContest = () => {
    contestsAPI.getBySlug(slug)
      .then(res => {
        setContest(res.data.data.contest);
        setIsRegistered(res.data.data.isRegistered);
        setProblems(res.data.data.problems || []);
      })
      .catch(err => {
        console.error(err);
        navigate('/contests');
      })
      .finally(() => setLoading(false));
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    try {
      await contestsAPI.register(slug);
      fetchContest();
    } catch (err) {
      alert('Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!contest) return null;

  const now = new Date();
  const start = new Date(contest.start_time);
  const end = new Date(contest.end_time);
  const hasStarted = now >= start;
  const hasEnded = now > end;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{contest.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {hasEnded ? 'Ended on ' + end.toLocaleString() : hasStarted ? 'Ends on ' + end.toLocaleString() : 'Starts on ' + start.toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to={`/contests/${slug}/scoreboard`} className="btn btn-ghost">Scoreboard</Link>
          
          {!isRegistered && !hasEnded && (
            <button className="btn btn-primary" onClick={handleRegister} disabled={registering}>
              {registering ? 'Registering...' : 'Register Now'}
            </button>
          )}
          {isRegistered && !hasEnded && (
            <span className="btn" style={{ background: 'var(--verdict-ac)', color: '#fff', cursor: 'default' }}>Registered ✓</span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Overview</h3>
        <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{contest.description || 'No description provided.'}</p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scoring Format</div>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{contest.scoring}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration</div>
            <div style={{ fontWeight: 'bold' }}>{(end - start) / 3600000} hours</div>
          </div>
        </div>
      </div>

      {hasStarted && (isRegistered || user?.role === 'admin') ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="submissions-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Problem Title</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.label}</td>
                    <td style={{ fontWeight: 'bold' }}>
                      <Link to={`/problems/${p.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {p.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`difficulty-${p.difficulty}`} style={{ textTransform: 'capitalize' }}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td>{p.max_score}</td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No problems assigned.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          {hasEnded ? (
            <p style={{ color: 'var(--text-muted)' }}>This contest has ended. Problems may be available in the main archive.</p>
          ) : isRegistered ? (
            <div>
              <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Waiting for contest to start...</h2>
              <p>The problems will appear here automatically when the contest begins.</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Register for this contest to view and solve the problems.</p>
          )}
        </div>
      )}
    </div>
  );
}
