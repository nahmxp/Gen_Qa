import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import withEnumeratorAuth from '../lib/withEnumeratorAuth';

function QueryCollectionPage() {
  const [form, setForm] = useState({ 
    personName: '', 
    contactInfo: '', 
    location: '', 
    latitude: '', 
    longitude: '', 
    category: 'Infrastructure',
    problemTitle: '',
    description: '',
    urgency: 'Medium',
    adminNotes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get address from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'General-QA-App/1.0'
              }
            }
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setForm(prev => ({
              ...prev,
              location: data.display_name,
              latitude,
              longitude
            }));
          } else {
            setForm(prev => ({
              ...prev,
              location: `${latitude}, ${longitude}`,
              latitude,
              longitude
            }));
          }
        } catch (err) {
          setForm(prev => ({
            ...prev,
            location: `${latitude}, ${longitude}`,
            latitude,
            longitude
          }));
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enter location manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable. Please enter location manually.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again or enter manually.');
            break;
          default:
            setError('Error getting location. Please enter location manually.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!form.location) {
      setError('Location is required');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Request failed with status ${res.status}`);
      }
      
      const json = await res.json();
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting query:', err);
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="query-success">
        <h2>✅ Query Collected Successfully</h2>
        <p>The query has been recorded and saved to the database. You can view it in the admin queries page.</p>
        <div className="success-actions">
          <Link href="/admin/queries">
            <button className="btn-primary">View All Queries</button>
          </Link>
          <button className="btn-outline" onClick={() => {
            setSubmitted(false);
            setForm({ 
              personName: '', 
              contactInfo: '', 
              location: '', 
              latitude: '', 
              longitude: '', 
              category: 'Infrastructure',
              problemTitle: '',
              description: '',
              urgency: 'Medium',
              adminNotes: ''
            });
          }}>Collect Another Query</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <style>{`
          .query-collection-page { max-width: 900px; margin: 2rem auto; padding: 1rem; }
          .query-collection-page h1 { margin-bottom: 0.5rem; }
          .query-collection-page .lead { color: #555; margin-bottom: 2rem; font-size: 1.1rem; }
          .query-collection-page .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; }
          .query-collection-page label { font-weight: 600; margin-bottom: 0.5rem; color: #333; }
          .query-collection-page label .required { color: #e74c3c; }
          .query-collection-page input, 
          .query-collection-page textarea, 
          .query-collection-page select { 
            padding: 0.7rem; 
            border-radius: 6px; 
            border: 1px solid #ddd; 
            font-size: 1rem;
            font-family: inherit;
          }
          .query-collection-page input:focus, 
          .query-collection-page textarea:focus, 
          .query-collection-page select:focus { 
            outline: none; 
            border-color: #667eea; 
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
          }
          .query-collection-page .location-input-group { display: flex; gap: 0.5rem; align-items: flex-start; }
          .query-collection-page .location-input-group input { flex: 1; }
          .query-collection-page .btn-location { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 0.7rem 1rem; 
            border-radius: 6px; 
            cursor: pointer; 
            white-space: nowrap;
            font-size: 0.9rem;
            transition: background 0.2s;
          }
          .query-collection-page .btn-location:hover:not(:disabled) { background: #45a049; }
          .query-collection-page .btn-location:disabled { 
            background: #ccc; 
            cursor: not-allowed; 
            opacity: 0.7; 
          }
          .query-collection-page .form-actions { display: flex; gap: 0.8rem; margin-top: 2rem; }
          .query-collection-page .btn-primary { 
            background: #667eea; 
            color: white; 
            border: none; 
            padding: 0.8rem 1.5rem; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 1rem;
            font-weight: 600;
            transition: background 0.2s;
          }
          .query-collection-page .btn-primary:hover:not(:disabled) { background: #5568d3; }
          .query-collection-page .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          .query-collection-page .btn-outline { 
            background: transparent; 
            border: 1px solid #667eea; 
            color: #667eea; 
            padding: 0.8rem 1.5rem; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 1rem;
            transition: background 0.2s;
          }
          .query-collection-page .btn-outline:hover { background: #f0f0ff; }
          .query-collection-page .form-error { 
            background: #fee; 
            color: #c33; 
            padding: 1rem; 
            border-radius: 6px; 
            margin-bottom: 1rem; 
            border: 1px solid #fcc; 
          }
          .query-collection-page .query-success { 
            max-width: 600px; 
            margin: 4rem auto; 
            padding: 2rem; 
            text-align: center; 
            background: #f0f9ff; 
            border-radius: 12px; 
            border: 2px solid #4CAF50; 
          }
          .query-collection-page .query-success h2 { color: #4CAF50; margin-bottom: 1rem; }
          .query-collection-page .success-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; }
          .query-collection-page .info-box { 
            background: #e3f2fd; 
            padding: 1rem; 
            border-radius: 6px; 
            margin-bottom: 2rem; 
            border-left: 4px solid #2196F3; 
          }
          .query-collection-page .info-box p { margin: 0; color: #1976D2; }
          @media (max-width: 600px) {
            .query-collection-page .location-input-group { flex-direction: column; }
            .query-collection-page .btn-location { width: 100%; }
            .query-collection-page .form-actions { flex-direction: column; }
            .query-collection-page .success-actions { flex-direction: column; }
          }
        `}</style>
      </Head>
      <div className="query-collection-page">
        <h1>📋 Collect Rural Area Query</h1>
        <p className="lead">Fill out this form to record problems and queries from people in rural areas during your field visits.</p>
        
        <div className="info-box">
          <p><strong>💡 Tip:</strong> Use the location button to automatically capture your current location when visiting rural areas.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="personName">
              Person's Name <span className="required">*</span>
            </label>
            <input 
              id="personName" 
              name="personName" 
              value={form.personName} 
              onChange={handleChange} 
              placeholder="Enter the name of the person reporting the problem"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactInfo">Contact Information</label>
            <input 
              id="contactInfo" 
              name="contactInfo" 
              value={form.contactInfo} 
              onChange={handleChange} 
              placeholder="Phone number or email (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Location <span className="required">*</span>
            </label>
            <div className="location-input-group">
              <input 
                id="location" 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                placeholder="Enter location or use device location"
                required 
              />
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="btn-location"
                disabled={isGettingLocation}
              >
                {isGettingLocation ? 'Getting...' : '📍 Get Location'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Problem Category <span className="required">*</span>
            </label>
            <select 
              id="category" 
              name="category" 
              value={form.category} 
              onChange={handleChange}
              required
            >
              <option value="Infrastructure">Infrastructure (Roads, Buildings, etc.)</option>
              <option value="Health">Health (Healthcare, Medical Facilities)</option>
              <option value="Education">Education (Schools, Learning Facilities)</option>
              <option value="Agriculture">Agriculture (Farming, Livestock)</option>
              <option value="Water">Water (Supply, Quality, Access)</option>
              <option value="Electricity">Electricity (Power Supply, Grid)</option>
              <option value="Transportation">Transportation (Public Transport, Connectivity)</option>
              <option value="Communication">Communication (Internet, Phone, Network)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="problemTitle">
              Problem Title <span className="required">*</span>
            </label>
            <input 
              id="problemTitle" 
              name="problemTitle" 
              value={form.problemTitle} 
              onChange={handleChange} 
              placeholder="Brief title describing the problem"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Problem Description <span className="required">*</span>
            </label>
            <textarea 
              id="description" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={6}
              placeholder="Describe the problem in detail..."
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="urgency">
              Urgency Level <span className="required">*</span>
            </label>
            <select 
              id="urgency" 
              name="urgency" 
              value={form.urgency} 
              onChange={handleChange}
              required
            >
              <option value="Low">Low - Can be addressed in due time</option>
              <option value="Medium">Medium - Needs attention soon</option>
              <option value="High">High - Requires immediate attention</option>
              <option value="Critical">Critical - Emergency situation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="adminNotes">Admin Notes (Optional)</label>
            <textarea 
              id="adminNotes" 
              name="adminNotes" 
              value={form.adminNotes} 
              onChange={handleChange} 
              rows={3}
              placeholder="Any additional notes or observations..."
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Query'}
            </button>
            <Link href="/admin/queries">
              <button type="button" className="btn-outline">View All Queries</button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default withEnumeratorAuth(QueryCollectionPage);

