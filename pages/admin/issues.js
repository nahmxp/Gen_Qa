import { useEffect, useState } from 'react';
import withAdminAuth from '../../lib/withAdminAuth';
import Layout from '../../components/Layout';

function AdminIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch('/api/admin/problems');
        if (res.ok) {
          const json = await res.json();
          setIssues(json.data || []);
        } else {
          console.error('Failed to load issues', res.status);
        }
      } catch (err) {
        console.error('Error fetching issues', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return (
    <Layout>
      <div className="admin-issues">
        <h1>All Issues Raised</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="issues-table">
            {issues.length === 0 ? (
              <p>No issues submitted yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Title</th>
                    <th>Reporter</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i._id}>
                      <td>{new Date(i.createdAt).toLocaleString()}</td>
                      <td style={{ maxWidth: 400 }}>{i.title}</td>
                      <td>{i.anonymous ? 'Anonymous' : (i.email || (i.user ? i.user.toString() : 'Unknown'))}</td>
                      <td>{i.status}</td>
                      <td>
                        <button className="btn-link" onClick={() => setSelected(i)}>View / Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selected && (
          <div className="issue-modal">
            <div className="modal-inner">
              <h3>{selected.title}</h3>
              <div className="meta">Submitted: {new Date(selected.createdAt).toLocaleString()} — Reporter: {selected.anonymous ? 'Anonymous' : (selected.email || 'Registered User')}</div>
              <div className="description"><pre style={{ whiteSpace: 'pre-wrap' }}>{selected.description}</pre></div>
              <div className="modal-actions">
                <label>
                  Status:
                  <select value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
                    <option value="open">open</option>
                    <option value="in-progress">in-progress</option>
                    <option value="closed">closed</option>
                  </select>
                </label>
                <button className="btn-primary" onClick={async () => {
                  setUpdating(true);
                  try {
                    const res = await fetch(`/api/admin/problems/${selected._id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: selected.status })
                    });
                    if (!res.ok) throw new Error('Update failed');
                    const json = await res.json();
                    setIssues(prev => prev.map(p => p._id === json.data._id ? json.data : p));
                    setSelected(json.data);
                  } catch (err) {
                    console.error(err);
                    alert('Failed to update status');
                  } finally {
                    setUpdating(false);
                  }
                }} disabled={updating}>{updating ? 'Saving…' : 'Save'}</button>
                <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-issues { max-width: 1100px; margin: 2rem auto; padding: 1rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 0.6rem; border-bottom: 1px solid #eee; }
        thead th { background: #f7f7f7; }
        .btn-link { background: none; border: none; color: var(--primary-color, #667eea); cursor: pointer; }
        .issue-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); z-index: 2000; }
        .modal-inner { background: #fff; padding: 1.2rem; border-radius: 8px; max-width: 900px; width: 95%; max-height: 80vh; overflow: auto; }
        .modal-actions { display:flex; gap: 0.6rem; margin-top: 1rem; align-items: center; }
        .description { margin-top: 0.8rem; padding: 0.8rem; background: #f9f9f9; border-radius: 6px; }
      `}</style>
    </Layout>
  );
}

export default withAdminAuth(AdminIssuesPage);
