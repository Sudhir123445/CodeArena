import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../../api/problems';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = () => {
    setLoading(true);
    problemsAPI.getAll({ limit: 100 })
      .then((res) => setProblems(res.data.data.problems))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await problemsAPI.delete(id);
      setProblems(problems.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete problem');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage problems, test cases, and platform settings.</p>
        </div>
        <Link to="/admin/problems/new" className="btn btn-primary">
          + Create Problem
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}><LoadingSpinner /></div>
        ) : (
          <div className="table-responsive">
            <table className="submissions-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{p.title}</td>
                    <td>
                      <span className={`difficulty-${p.difficulty}`} style={{ textTransform: 'capitalize' }}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td>
                      {p.is_published ? (
                        <span style={{ color: 'var(--verdict-ac)', fontSize: '0.8rem', fontWeight: 'bold' }}>Public</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>Draft</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/problems/${p.slug}/testcases`} className="btn btn-ghost btn-sm" title="Manage Test Cases">
                        🧪
                      </Link>
                      <Link to={`/admin/problems/${p.slug}/edit`} className="btn btn-ghost btn-sm" title="Edit Problem">
                        ✏️
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id, p.title)} title="Delete Problem">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No problems exist yet.</td>
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
