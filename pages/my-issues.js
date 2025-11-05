import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import withAuth from '../lib/withAuth';

function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const res = await fetch('/api/problems');
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

    fetchMyIssues();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#667eea';
      case 'in-progress':
        return '#ff9800';
      case 'closed':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  return (
    <>
      <Head>
        <style>{`
          .my-issues { max-width: 1100px; margin: 2rem auto; padding: 1rem; }
          .my-issues h1 { margin-bottom: 1.5rem; }
          .my-issues .subtitle { color: #666; margin-bottom: 2rem; }
          .my-issues table { width: 100%; border-collapse: collapse; background: #fff; }
          .my-issues th, .my-issues td { text-align: left; padding: 0.8rem; border-bottom: 1px solid #eee; }
          .my-issues thead th { background: #f7f7f7; font-weight: 600; }
          .my-issues .btn-link { background: none; border: none; color: var(--primary-color, #667eea); cursor: pointer; text-decoration: underline; }
          .my-issues .status-badge { 
            display: inline-block; 
            padding: 0.3rem 0.8rem; 
            border-radius: 12px; 
            font-size: 0.85rem; 
            font-weight: 500;
            text-transform: capitalize;
          }
          .my-issues .issue-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); z-index: 2000; }
          .my-issues .modal-inner { background: #fff; padding: 1.5rem; border-radius: 8px; max-width: 900px; width: 95%; max-height: 80vh; overflow: auto; }
          .my-issues .modal-inner h3 { margin-top: 0; }
          .my-issues .meta { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
          .my-issues .location-section { 
            margin-top: 1rem; 
            padding: 1rem; 
            background: #f0f7ff; 
            border-radius: 6px; 
            border-left: 4px solid #667eea; 
          }
          .my-issues .location-section h4 { 
            margin: 0 0 0.8rem 0; 
            color: #333; 
            font-size: 1rem; 
          }
          .my-issues .location-details { 
            display: flex; 
            flex-direction: column; 
            gap: 0.5rem; 
          }
          .my-issues .location-details p { 
            margin: 0; 
            color: #555; 
            font-size: 0.95rem; 
          }
          .my-issues .location-details strong { 
            color: #333; 
            margin-right: 0.5rem; 
          }
          .my-issues .map-link-btn { 
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
          .my-issues .map-link-btn:hover { 
            background: #5568d3; 
          }
          .my-issues .description { margin-top: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 6px; white-space: pre-wrap; }
          .my-issues .admin-remarks { 
            margin-top: 1rem; 
            padding: 1rem; 
            background: #fff3cd; 
            border-radius: 6px; 
            border-left: 4px solid #ffc107; 
            color: #856404;
          }
          .my-issues .admin-remarks h4 { 
            margin: 0 0 0.5rem 0; 
            color: #856404; 
            font-size: 1rem;
          }
          .my-issues .admin-remarks p { 
            margin: 0; 
            color: #856404; 
            white-space: pre-wrap; 
            font-size: 0.95rem;
          }
          .my-issues .modal-actions { display: flex; gap: 0.6rem; margin-top: 1.5rem; justify-content: flex-end; }
          .my-issues .btn-outline { background: transparent; border: 1px solid #667eea; color: #667eea; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
          .my-issues .btn-outline:hover { background: #f0f0ff; }
          .my-issues .empty-state { text-align: center; padding: 3rem 1rem; color: #666; }
          .my-issues .empty-state h3 { color: #333; margin-bottom: 0.5rem; }
          @media (max-width: 768px) {
            .my-issues table { font-size: 0.9rem; }
            .my-issues th, .my-issues td { padding: 0.5rem; }
            .my-issues .modal-inner { padding: 1rem; }
          }
        `}</style>
      </Head>
      <div className="my-issues">
        <h1>My Submitted Issues</h1>
        <p className="subtitle">View and track the status of issues you've submitted</p>
        
        {loading ? (
          <p>Loading your issues...</p>
        ) : (
          <div className="issues-table">
            {issues.length === 0 ? (
              <div className="empty-state">
                <h3>No issues submitted yet</h3>
                <p>You haven't submitted any issues. Start by sharing a problem you're facing.</p>
                <Link href="/share-problem">
                  <button className="btn-outline" style={{ marginTop: '1rem' }}>Share a Problem</button>
                </Link>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i._id}>
                      <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                      <td style={{ maxWidth: 300 }}>{i.title}</td>
                      <td style={{ maxWidth: 250, fontSize: '0.9rem' }}>
                        {i.location ? (
                          <span>{i.location.length > 40 ? i.location.substring(0, 40) + '...' : i.location}</span>
                        ) : (
                          <span style={{ color: '#999' }}>No location</span>
                        )}
                      </td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ 
                            backgroundColor: getStatusColor(i.status) + '20',
                            color: getStatusColor(i.status)
                          }}
                        >
                          {i.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-link" onClick={() => setSelected(i)}>View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selected && (
          <div className="issue-modal" onClick={() => setSelected(null)}>
            <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
              <h3>{selected.title}</h3>
              <div className="meta">
                Submitted: {new Date(selected.createdAt).toLocaleString()}
                {selected.updatedAt && selected.updatedAt !== selected.createdAt && (
                  <> • Updated: {new Date(selected.updatedAt).toLocaleString()}</>
                )}
              </div>
              
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
              
              <div className="description">{selected.description}</div>
              
              {selected.adminNotes && (
                <div className="admin-remarks">
                  <h4>📝 Admin Remarks</h4>
                  <p>{selected.adminNotes}</p>
                </div>
              )}
              
              <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#f0f0f0', borderRadius: '6px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  className="status-badge" 
                  style={{ 
                    backgroundColor: getStatusColor(selected.status) + '20',
                    color: getStatusColor(selected.status)
                  }}
                >
                  {selected.status}
                </span>
              </div>
              
              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(MyIssuesPage);

