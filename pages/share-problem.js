import { useState } from 'react';
import Link from 'next/link';

export default function ShareProblem() {
  const [form, setForm] = useState({ title: '', description: '', email: '', anonymous: false });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        .form-actions { display:flex; gap: 0.5rem; }
        .btn-primary { background:#667eea; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; }
        .btn-outline { background:transparent; border:1px solid #667eea; color:#667eea; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; }
      `}</style>
    </div>
  );
}
