import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemsAPI } from '../../api/problems';
import { testcasesAPI } from '../../api/testcases';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminTestCases() {
  const { slug } = useParams();
  
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newTc, setNewTc] = useState({
    input: '',
    expected_output: '',
    is_sample: false,
    order_index: 0,
    score_weight: 1
  });

  useEffect(() => {
    setLoading(true);
    problemsAPI.getBySlug(slug)
      .then(res => {
        const p = res.data.data.problem;
        setProblem(p);
        return testcasesAPI.getByProblem(p.id);
      })
      .then(res => {
        setTestCases(res.data.data.testCases);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test case?')) return;
    try {
      await testcasesAPI.delete(id);
      setTestCases(testCases.filter(tc => tc.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await testcasesAPI.create({ ...newTc, problem_id: problem.id });
      setTestCases([...testCases, res.data.data.testCase]);
      setNewTc({ input: '', expected_output: '', is_sample: false, order_index: testCases.length + 1, score_weight: 1 });
    } catch (err) {
      alert('Failed to add test case');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!problem) return <div className="empty-state">Problem not found</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Test Cases: {problem.title}</h1>
          <p>Manage test cases for this problem.</p>
        </div>
        <Link to="/admin/problems" className="btn btn-ghost">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Existing Test Cases */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Existing Cases ({testCases.length})</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {testCases.map((tc, idx) => (
              <div key={tc.id} style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    Case #{tc.order_index} 
                    {tc.is_sample && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Sample</span>}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '1rem' }}>Weight: {tc.score_weight}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tc.id)} style={{ color: 'var(--verdict-re)', padding: '0 0.5rem' }}>Delete</button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Input</div>
                    <pre style={{ margin: 0, padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                      {tc.input}
                    </pre>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Output</div>
                    <pre style={{ margin: 0, padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                      {tc.output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
            
            {testCases.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                No test cases yet. Add one!
              </div>
            )}
          </div>
        </div>

        {/* Add New Test Case */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Add Test Case</h2>
          
          <form onSubmit={handleAdd} className="auth-form">
            <div className="form-group">
              <label className="form-label">Input Data</label>
              <textarea 
                className="form-input" 
                rows={5} 
                value={newTc.input} 
                onChange={(e) => setNewTc({...newTc, input: e.target.value})}
                required 
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Output</label>
              <textarea 
                className="form-input" 
                rows={5} 
                value={newTc.expected_output} 
                onChange={(e) => setNewTc({...newTc, expected_output: e.target.value})}
                required 
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Order Index</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newTc.order_index} 
                  onChange={(e) => setNewTc({...newTc, order_index: Number(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Score Weight</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newTc.score_weight} 
                  onChange={(e) => setNewTc({...newTc, score_weight: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={newTc.is_sample}
                  onChange={(e) => setNewTc({...newTc, is_sample: e.target.checked})}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                Is Sample (Visible to users)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              Add Test Case
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
