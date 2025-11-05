import { useState } from 'react';
import Link from 'next/link';

export default function ShareProblem() {
  const [form, setForm] = useState({ title: '', description: '', email: '', location: '', latitude: '', longitude: '', anonymous: false });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
          // Using a free reverse geocoding service (OpenStreetMap Nominatim)
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
            // Fallback to coordinates if address not found
            setForm(prev => ({
              ...prev,
              location: `${latitude}, ${longitude}`,
              latitude,
              longitude
            }));
          }
        } catch (err) {
          // Fallback to coordinates if reverse geocoding fails
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
            setError('Location access denied. Please enter your location manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable. Please enter your location manually.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again or enter manually.');
            break;
          default:
            setError('Error getting location. Please enter your location manually.');
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
    try {
      const res = await fetch('/api/problems', {
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
      console.error('Error submitting problem:', err);
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="share-success">
        <h2>Thanks — your problem has been shared</h2>
        <p>Someone from the community or our support team will review and respond where possible.</p>
        <Link href="/home"><button className="btn-primary">Return Home</button></Link>
      </div>
    );
  }

  return (
    <div className="share-problem-page">
      <h1>Share a Problem</h1>
      <p className="lead">Describe your problem clearly so others can help — include steps, expected behavior, and any relevant details.</p>
      <form onSubmit={handleSubmit} className="share-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={8} required />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <div className="location-input-group">
            <input 
              id="location" 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              placeholder="Enter your location or use device location"
              required 
            />
            <button 
              type="button" 
              onClick={handleGetLocation} 
              className="btn-location"
              disabled={isGettingLocation}
            >
              {isGettingLocation ? 'Getting...' : '📍 Get My Location'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Contact Email (optional)</label>
          <input id="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" name="anonymous" checked={form.anonymous} onChange={handleChange} /> Share anonymously
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Sharing…' : 'Share Problem'}</button>
          <Link href="/contact"><button type="button" className="btn-outline">Contact Support</button></Link>
        </div>
      </form>

      <style jsx>{`
        .share-problem-page { max-width: 900px; margin: 2rem auto; padding: 1rem; }
        .lead { color: #555; margin-bottom: 1rem; }
        .form-group { margin-bottom: 1rem; display:flex; flex-direction:column; }
        input, textarea { padding: 0.6rem; border-radius: 6px; border: 1px solid #ddd; }
        .location-input-group { display: flex; gap: 0.5rem; align-items: flex-start; }
        .location-input-group input { flex: 1; }
        .btn-location { 
          background: #4CAF50; 
          color: white; 
          border: none; 
          padding: 0.6rem 1rem; 
          border-radius: 6px; 
          cursor: pointer; 
          white-space: nowrap;
          font-size: 0.9rem;
          transition: background 0.2s;
        }
        .btn-location:hover:not(:disabled) { background: #45a049; }
        .btn-location:disabled { 
          background: #ccc; 
          cursor: not-allowed; 
          opacity: 0.7; 
        }
        .form-actions { display:flex; gap: 0.5rem; }
        .btn-primary { background:#667eea; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; }
        .btn-outline { background:transparent; border:1px solid #667eea; color:#667eea; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; }
        .form-error { 
          background: #fee; 
          color: #c33; 
          padding: 0.8rem; 
          border-radius: 6px; 
          margin-bottom: 1rem; 
          border: 1px solid #fcc; 
        }
        @media (max-width: 600px) {
          .location-input-group { 
            flex-direction: column; 
          }
          .btn-location { 
            width: 100%; 
          }
        }
      `}</style>
    </div>
  );
}
