import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import withAdminAuth from '../../lib/withAdminAuth';

function AdminQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState({ category: 'all', status: 'all', urgency: 'all' });

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await fetch('/api/queries');
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

    fetchQueries();
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

  const filteredQueries = queries.filter(query => {
    if (filter.category !== 'all' && query.category !== filter.category) return false;
    if (filter.status !== 'all' && query.status !== filter.status) return false;
    if (filter.urgency !== 'all' && query.urgency !== filter.urgency) return false;
    return true;
  });

  const categories = ['Infrastructure', 'Health', 'Education', 'Agriculture', 'Water', 'Electricity', 'Transportation', 'Communication', 'Other'];
  const statuses = ['collected', 'reviewed', 'in-progress', 'resolved'];
  const urgencies = ['Low', 'Medium', 'High', 'Critical'];

  return (
    <>
      <Head>
        <style>{`
          .admin-queries { max-width: 1400px; margin: 2rem auto; padding: 1rem; }
          .admin-queries h1 { margin-bottom: 0.5rem; }
          .admin-queries .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
          .admin-queries .filters { display: flex; gap: 1rem; flex-wrap: wrap; }
          .admin-queries .filter-group { display: flex; flex-direction: column; gap: 0.3rem; }
          .admin-queries .filter-group label { font-size: 0.85rem; color: #666; font-weight: 600; }
          .admin-queries .filter-group select { padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd; }
          .admin-queries table { width: 100%; border-collapse: collapse; background: #fff; }
          .admin-queries th, .admin-queries td { text-align: left; padding: 0.8rem; border-bottom: 1px solid #eee; }
          .admin-queries thead th { background: #f7f7f7; font-weight: 600; }
          .admin-queries .btn-link { background: none; border: none; color: var(--primary-color, #667eea); cursor: pointer; text-decoration: underline; }
          .admin-queries .status-badge, .admin-queries .urgency-badge { 
            display: inline-block; 
            padding: 0.3rem 0.8rem; 
            border-radius: 12px; 
            font-size: 0.85rem; 
            font-weight: 500;
            text-transform: capitalize;
          }
          .admin-queries .query-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); z-index: 2000; }
          .admin-queries .modal-inner { background: #fff; padding: 1.5rem; border-radius: 8px; max-width: 900px; width: 95%; max-height: 80vh; overflow: auto; }
          .admin-queries .modal-inner h3 { margin-top: 0; }
          .admin-queries .meta { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
          .admin-queries .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
          .admin-queries .info-item { padding: 0.8rem; background: #f9f9f9; border-radius: 6px; }
          .admin-queries .info-item strong { display: block; color: #666; font-size: 0.85rem; margin-bottom: 0.3rem; }
          .admin-queries .location-section { 
            margin-top: 1rem; 
            padding: 1rem; 
            background: #f0f7ff; 
            border-radius: 6px; 
            border-left: 4px solid #667eea; 
          }
          .admin-queries .location-section h4 { margin: 0 0 0.8rem 0; color: #333; font-size: 1rem; }
          .admin-queries .location-details { display: flex; flex-direction: column; gap: 0.5rem; }
          .admin-queries .location-details p { margin: 0; color: #555; font-size: 0.95rem; }
          .admin-queries .location-details strong { color: #333; margin-right: 0.5rem; }
          .admin-queries .map-link-btn { 
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
          .admin-queries .map-link-btn:hover { background: #5568d3; }
          .admin-queries .description { margin-top: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 6px; white-space: pre-wrap; }
          .admin-queries .admin-notes { margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107; }
          .admin-queries .admin-notes h4 { margin: 0 0 0.5rem 0; color: #856404; }
          .admin-queries .admin-notes p { margin: 0; color: #856404; white-space: pre-wrap; }
          .admin-queries .modal-actions { display: flex; gap: 0.6rem; margin-top: 1.5rem; align-items: center; }
          .admin-queries .btn-outline { background: transparent; border: 1px solid #667eea; color: #667eea; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
          .admin-queries .btn-outline:hover { background: #f0f0ff; }
          .admin-queries .btn-primary { background: #667eea; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
          .admin-queries .btn-primary:hover:not(:disabled) { background: #5568d3; }
          .admin-queries .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          .admin-queries .empty-state { text-align: center; padding: 3rem 1rem; color: #666; }
          @media (max-width: 768px) {
            .admin-queries table { font-size: 0.9rem; }
            .admin-queries th, .admin-queries td { padding: 0.5rem; }
            .admin-queries .modal-inner { padding: 1rem; }
            .admin-queries .info-grid { grid-template-columns: 1fr; }
            .admin-queries .filters { flex-direction: column; }
            .admin-queries .filter-group { width: 100%; }
          }
        `}</style>
      </Head>
      <div className="admin-queries">
        <h1>📋 Collected Queries</h1>
        <div className="header-actions">
          <div className="filters">
            <div className="filter-group">
              <label>Category</label>
              <select value={filter.category} onChange={(e) => setFilter({...filter, category: e.target.value})}>
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
                <option value="all">All Statuses</option>
                {statuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Urgency</label>
              <select value={filter.urgency} onChange={(e) => setFilter({...filter, urgency: e.target.value})}>
                <option value="all">All Urgency</option>
                {urgencies.map(urg => <option key={urg} value={urg}>{urg}</option>)}
              </select>
            </div>
          </div>
          <Link href="/query-collection">
            <button className="btn-primary">➕ Collect New Query</button>
          </Link>
        </div>
        
        {loading ? (
          <p>Loading queries...</p>
        ) : (
          <div className="queries-table">
            {filteredQueries.length === 0 ? (
              <div className="empty-state">
                <h3>No queries found</h3>
                <p>{queries.length === 0 ? 'No queries have been collected yet.' : 'No queries match the selected filters.'}</p>
                <Link href="/query-collection">
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>Collect First Query</button>
                </Link>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Person</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Collected By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueries.map((q) => (
                    <tr key={q._id}>
                      <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td>{q.personName}</td>
                      <td>{q.category}</td>
                      <td style={{ maxWidth: 250 }}>{q.problemTitle}</td>
                      <td style={{ maxWidth: 200, fontSize: '0.85rem' }}>
                        {q.location ? (
                          <span>{q.location.length > 30 ? q.location.substring(0, 30) + '...' : q.location}</span>
                        ) : (
                          <span style={{ color: '#999' }}>No location</span>
                        )}
                      </td>
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
                      <td>{q.collectedBy?.name || 'Unknown'}</td>
                      <td>
                        <button className="btn-link" onClick={() => setSelected(q)}>View / Edit</button>
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
                  <span>{selected.personName}</span>
                </div>
                <div className="info-item">
                  <strong>Contact</strong>
                  <span>{selected.contactInfo || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <strong>Category</strong>
                  <span>{selected.category}</span>
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
                <div className="info-item">
                  <strong>Status</strong>
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
                <div className="info-item">
                  <strong>Collected By</strong>
                  <span>{selected.collectedBy?.name || 'Unknown'}</span>
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
              
              <div className="description">
                <strong>Description:</strong><br />
                {selected.description}
              </div>

              {/* Admin Remarks Section */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  📝 Admin Remarks (Optional Feedback):
                </label>
                <textarea
                  value={selected.adminNotes || ''}
                  onChange={(e) => setSelected({ ...selected, adminNotes: e.target.value })}
                  placeholder="Add any remarks or feedback about this query..."
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
                    <option value="collected">Collected</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <button 
                  className="btn-primary" 
                  onClick={async () => {
                    setUpdating(true);
                    try {
                      const res = await fetch(`/api/admin/queries/${selected._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          status: selected.status,
                          adminNotes: selected.adminNotes || ''
                        })
                      });
                      if (!res.ok) throw new Error('Update failed');
                      const json = await res.json();
                      setQueries(prev => prev.map(q => q._id === json.data._id ? json.data : q));
                      setSelected(json.data);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to update query');
                    } finally {
                      setUpdating(false);
                    }
                  }} 
                  disabled={updating}
                >
                  {updating ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default withAdminAuth(AdminQueriesPage);

