import { useEffect, useState } from 'react';
import Head from 'next/head';
import withAdminAuth from '../../lib/withAdminAuth';

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
    <>
      <Head>
        <style>{`
          .admin-issues { max-width: 1100px; margin: 2rem auto; padding: 1rem; }
          .admin-issues table { width: 100%; border-collapse: collapse; }
          .admin-issues th, .admin-issues td { text-align: left; padding: 0.6rem; border-bottom: 1px solid #eee; }
          .admin-issues thead th { background: #f7f7f7; }
          .admin-issues .btn-link { background: none; border: none; color: var(--primary-color, #667eea); cursor: pointer; }
          .admin-issues .location-cell { display: flex; flex-direction: column; gap: 0.3rem; }
          .admin-issues .map-link { 
            font-size: 0.85rem; 
            color: #667eea; 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 0.3rem;
          }
          .admin-issues .map-link:hover { text-decoration: underline; }
          .admin-issues .issue-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); z-index: 2000; }
          .admin-issues .modal-inner { background: #fff; padding: 1.2rem; border-radius: 8px; max-width: 900px; width: 95%; max-height: 80vh; overflow: auto; }
          .admin-issues .location-section { 
            margin-top: 1rem; 
            padding: 1rem; 
            background: #f0f7ff; 
            border-radius: 6px; 
            border-left: 4px solid #667eea; 
          }
          .admin-issues .location-section h4 { 
            margin: 0 0 0.8rem 0; 
            color: #333; 
            font-size: 1rem; 
          }
          .admin-issues .location-details { 
            display: flex; 
            flex-direction: column; 
            gap: 0.5rem; 
          }
          .admin-issues .location-details p { 
            margin: 0; 
            color: #555; 
            font-size: 0.95rem; 
          }
          .admin-issues .location-details strong { 
            color: #333; 
            margin-right: 0.5rem; 
          }
          .admin-issues .map-link-btn { 
            display: inline-flex; 
            align-items: center; 
            gap: 0.5rem; 
            padding: 0.6rem 1rem; 
            background: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 0.5rem; 
            width: fit-content; 
            transition: background 0.2s; 
          }
          .admin-issues .map-link-btn:hover { 
            background: #5568d3; 
          }
          .admin-issues .modal-actions { display:flex; gap: 0.6rem; margin-top: 1rem; align-items: center; }
          .admin-issues .description { margin-top: 0.8rem; padding: 0.8rem; background: #f9f9f9; border-radius: 6px; }
          @media (max-width: 768px) {
            .admin-issues table { font-size: 0.9rem; }
            .admin-issues th, .admin-issues td { padding: 0.4rem; }
            .admin-issues .location-cell { font-size: 0.85rem; }
          }
        `}</style>
      </Head>
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
                    <th>Location</th>
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
                      <td style={{ maxWidth: 250 }}>
                        {i.location ? (
                          <div className="location-cell">
                            <span>{i.location}</span>
                            {i.latitude && i.longitude && (
                              <a 
                                href={`https://www.google.com/maps?q=${i.latitude},${i.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📍 View on Map
                              </a>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>No location</span>
                        )}
                      </td>
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
              
              {selected.location && (
                <div className="location-section">
                  <h4>📍 Location</h4>
                  <div className="location-details">
                    <p><strong>Address:</strong> {selected.location}</p>
                    {selected.latitude && selected.longitude && (
                      <>
                        <p><strong>Coordinates:</strong> {typeof selected.latitude === 'number' ? selected.latitude.toFixed(6) : selected.latitude}, {typeof selected.longitude === 'number' ? selected.longitude.toFixed(6) : selected.longitude}</p>
                        <a 
                          href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="map-link-btn"
                        >
                          🗺️ Open in Google Maps
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="description"><pre style={{ whiteSpace: 'pre-wrap' }}>{selected.description}</pre></div>
              
              {/* Admin Remarks Section */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  📝 Admin Remarks (Optional Feedback):
                </label>
                <textarea
                  value={selected.adminNotes || ''}
                  onChange={(e) => setSelected({ ...selected, adminNotes: e.target.value })}
                  placeholder="Add any remarks or feedback about this issue..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.3rem' }}>
                  This feedback is only visible to administrators.
                </small>
              </div>
              
              <div className="modal-actions">
                <label>
                  Status:
                  <select 
                    value={selected.status} 
                    onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                    style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
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
                      body: JSON.stringify({ 
                        status: selected.status,
                        adminNotes: selected.adminNotes || ''
                      })
                    });
                    if (!res.ok) throw new Error('Update failed');
                    const json = await res.json();
                    setIssues(prev => prev.map(p => p._id === json.data._id ? json.data : p));
                    setSelected(json.data);
                  } catch (err) {
                    console.error(err);
                    alert('Failed to update issue');
                  } finally {
                    setUpdating(false);
                  }
                }} disabled={updating}>{updating ? 'Saving…' : 'Save Changes'}</button>
                <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default withAdminAuth(AdminIssuesPage);
