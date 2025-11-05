import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import withEnumeratorAuth from '../lib/withEnumeratorAuth';

function MyQuerySubmissionsPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchMyQueries = async () => {
      try {
        const res = await fetch('/api/queries?my=true');
        if (res.ok) {
          const json = await res.json();
          setQueries(json.data || []);
        } else {
          console.error('Failed to load queries', res.status);
        }
      } catch (err) {
        console.error('Error fetching queries', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyQueries();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'collected':
        return '#667eea';
      case 'reviewed':
        return '#ff9800';
      case 'in-progress':
        return '#2196F3';
      case 'resolved':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Low':
        return '#4caf50';
      case 'Medium':
        return '#ff9800';
      case 'High':
        return '#ff5722';
      case 'Critical':
        return '#f44336';
      default:
        return '#666';
    }
  };

  return (
    <>
      <Head>
        <style>{`
          .my-query-submissions { max-width: 1100px; margin: 2rem auto; padding: 1rem; }
          .my-query-submissions h1 { margin-bottom: 1.5rem; color: var(--text-color); }
          .my-query-submissions .subtitle { color: var(--text-muted, #666); margin-bottom: 2rem; }
          .my-query-submissions table { width: 100%; border-collapse: collapse; background: var(--card-bg, #fff); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .my-query-submissions th, .my-query-submissions td { text-align: left; padding: 0.8rem 1rem; border-bottom: 1px solid var(--border-color, #eee); }
          .my-query-submissions thead th { background: var(--bg-color, #f7f7f7); font-weight: 600; color: var(--text-color); }
          .my-query-submissions tbody tr:last-child td { border-bottom: none; }
          .my-query-submissions tbody tr:hover { background: var(--hover-bg, #f9f9f9); }
          .my-query-submissions .btn-link { background: none; border: none; color: var(--primary-color, #667eea); cursor: pointer; font-size: 0.9rem; text-decoration: underline; }
          .my-query-submissions .btn-link:hover { color: var(--primary-hover, #5568d3); }
          .my-query-submissions .status-badge, .my-query-submissions .urgency-badge { 
            display: inline-block; 
            padding: 0.3rem 0.8rem; 
            border-radius: 12px; 
            font-size: 0.85rem; 
            font-weight: 500;
            text-transform: capitalize;
          }
          .my-query-submissions .query-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); z-index: 2000; }
          .my-query-submissions .modal-inner { background: var(--card-bg, #fff); padding: 1.5rem; border-radius: 12px; max-width: 900px; width: 95%; max-height: 80vh; overflow: auto; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
          .my-query-submissions .modal-inner h3 { margin-top: 0; color: var(--text-color); }
          .my-query-submissions .meta { color: var(--text-muted, #666); font-size: 0.9rem; margin-bottom: 1rem; }
          .my-query-submissions .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
          .my-query-submissions .info-item { padding: 0.8rem; background: var(--bg-color, #f9f9f9); border-radius: 6px; }
          .my-query-submissions .info-item strong { display: block; color: var(--text-muted, #666); font-size: 0.85rem; margin-bottom: 0.3rem; }
          .my-query-submissions .location-section { 
            margin-top: 1rem; 
            padding: 1rem; 
            background: #f0f7ff; 
            border-radius: 6px; 
            border-left: 4px solid #667eea; 
            color: #333;
          }
          .my-query-submissions .location-section h4 { 
            margin: 0 0 0.8rem 0; 
            color: #333; 
            font-size: 1rem; 
          }
          .my-query-submissions .location-details { 
            display: flex; 
            flex-direction: column; 
            gap: 0.5rem; 
          }
          .my-query-submissions .location-details p { 
            margin: 0; 
            color: #555; 
            font-size: 0.95rem; 
          }
          .my-query-submissions .location-details strong { 
            color: #333; 
            margin-right: 0.5rem; 
          }
          .my-query-submissions .map-link-btn { 
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
          .my-query-submissions .map-link-btn:hover { 
            background: #5568d3; 
          }
          .my-query-submissions .description { margin-top: 1rem; padding: 1rem; background: var(--bg-color, #f9f9f9); border-radius: 6px; white-space: pre-wrap; color: var(--text-color); }
          .my-query-submissions .admin-notes { margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107; color: #856404; }
          .my-query-submissions .admin-notes h4 { margin: 0 0 0.5rem 0; color: #856404; }
          .my-query-submissions .admin-notes p { margin: 0; color: #856404; white-space: pre-wrap; }
          .my-query-submissions .modal-actions { display: flex; gap: 0.6rem; margin-top: 1.5rem; justify-content: flex-end; }
          .my-query-submissions .btn-outline { background: transparent; border: 1px solid var(--primary-color, #667eea); color: var(--primary-color, #667eea); padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
          .my-query-submissions .btn-outline:hover { background: var(--hover-bg, #f0f0ff); }
          .my-query-submissions .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted, #666); }
          .my-query-submissions .empty-state h3 { color: var(--text-color, #333); margin-bottom: 0.5rem; }
          @media (max-width: 768px) {
            .my-query-submissions table { font-size: 0.9rem; }
            .my-query-submissions th, .my-query-submissions td { padding: 0.6rem 0.8rem; }
            .my-query-submissions .modal-inner { padding: 1rem; }
            .my-query-submissions .info-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </Head>
      <div className="my-query-submissions">
        <h1>My Query Submissions</h1>
        <p className="subtitle">View and track the status of queries you've collected</p>
        
        {loading ? (
          <p>Loading your queries...</p>
        ) : (
          <div className="queries-table">
            {queries.length === 0 ? (
              <div className="empty-state">
                <h3>No queries submitted yet</h3>
                <p>You haven't collected any queries. Start by collecting a new query.</p>
                <Link href="/query-collection">
                  <button className="btn-outline" style={{ marginTop: '1rem' }}>Collect Query</button>
                </Link>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Collected</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((q) => (
                    <tr key={q._id}>
                      <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td style={{ maxWidth: 300 }}>{q.problemTitle}</td>
                      <td>{q.category}</td>
                      <td>
                        <span 
                          className="urgency-badge" 
                          style={{ 
                            backgroundColor: getUrgencyColor(q.urgency) + '20',
                            color: getUrgencyColor(q.urgency)
                          }}
                        >
                          {q.urgency}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ 
                            backgroundColor: getStatusColor(q.status) + '20',
                            color: getStatusColor(q.status)
                          }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-link" onClick={() => setSelected(q)}>View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selected && (
          <div className="query-modal" onClick={() => setSelected(null)}>
            <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
              <h3>{selected.problemTitle}</h3>
              <div className="meta">
                Collected: {new Date(selected.createdAt).toLocaleString()}
                {selected.updatedAt && selected.updatedAt !== selected.createdAt && (
                  <> • Updated: {new Date(selected.updatedAt).toLocaleString()}</>
                )}
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <strong>Person Name</strong>
                  {selected.personName}
                </div>
                <div className="info-item">
                  <strong>Contact Info</strong>
                  {selected.contactInfo || 'N/A'}
                </div>
                <div className="info-item">
                  <strong>Category</strong>
                  {selected.category}
                </div>
                <div className="info-item">
                  <strong>Urgency</strong>
                  <span 
                    className="urgency-badge" 
                    style={{ 
                      backgroundColor: getUrgencyColor(selected.urgency) + '20',
                      color: getUrgencyColor(selected.urgency)
                    }}
                  >
                    {selected.urgency}
                  </span>
                </div>
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
                <div className="admin-notes">
                  <h4>📝 Admin Remarks</h4>
                  <p>{selected.adminNotes}</p>
                </div>
              )}
              
              <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'var(--bg-color, #f0f0f0)', borderRadius: '6px' }}>
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

export default withEnumeratorAuth(MyQuerySubmissionsPage);

