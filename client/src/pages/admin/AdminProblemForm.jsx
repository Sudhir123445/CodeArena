import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { problemsAPI } from '../../api/problems';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminProblemForm() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditing = Boolean(slug);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'medium',
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    is_published: false,
    statement_md: '',
    input_format: '',
    output_format: '',
    constraints_text: ''
  });

  const [problemId, setProblemId] = useState(null);

  useEffect(() => {
    if (isEditing) {
      problemsAPI.getBySlug(slug)
        .then(res => {
          const p = res.data.data.problem;
          setProblemId(p.id);
          setFormData({
            title: p.title,
            slug: p.slug,
            difficulty: p.difficulty,
            time_limit_ms: p.time_limit_ms,
            memory_limit_kb: p.memory_limit_kb,
            is_published: p.is_published,
            statement_md: p.statement_md,
            input_format: p.input_format || '',
            output_format: p.output_format || '',
            constraints_text: p.constraints_text || ''
          });
        })
        .catch(err => {
          setError('Failed to load problem');
        })
        .finally(() => setLoading(false));
    }
  }, [isEditing, slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await problemsAPI.update(problemId, formData);
      } else {
        await problemsAPI.create(formData);
      }
      navigate('/admin/problems');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem. Check the slug uniqueness and data constraints.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Problem' : 'Create Problem'}</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Title</label>
            <input 
              type="text" 
              name="title"
              className="form-input" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug (URL-friendly)</label>
            <input 
              type="text" 
              name="slug"
              className="form-input" 
              value={formData.slug} 
              onChange={handleChange} 
              pattern="^[a-z0-9-]+$"
              required 
            />
            <small style={{ color: 'var(--text-muted)' }}>e.g. two-sum</small>
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select name="difficulty" className="form-input" value={formData.difficulty} onChange={handleChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Limit (ms)</label>
            <input 
              type="number" 
              name="time_limit_ms"
              className="form-input" 
              value={formData.time_limit_ms} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Memory Limit (KB)</label>
            <input 
              type="number" 
              name="memory_limit_kb"
              className="form-input" 
              value={formData.memory_limit_kb} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                style={{ width: '1.2rem', height: '1.2rem' }}
              />
              Publish Problem (Make visible to users)
            </label>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Problem Statement (Markdown)</label>
            <textarea 
              name="statement_md"
              className="form-input" 
              value={formData.statement_md} 
              onChange={handleChange} 
              rows={8}
              required 
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Input Format</label>
            <textarea 
              name="input_format"
              className="form-input" 
              value={formData.input_format} 
              onChange={handleChange} 
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Output Format</label>
            <textarea 
              name="output_format"
              className="form-input" 
              value={formData.output_format} 
              onChange={handleChange} 
              rows={4}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Constraints</label>
            <textarea 
              name="constraints_text"
              className="form-input" 
              value={formData.constraints_text} 
              onChange={handleChange} 
              rows={3}
            />
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Problem'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/problems')} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
