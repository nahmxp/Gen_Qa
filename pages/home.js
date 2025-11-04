import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="qa-home">
      <section className="hero">
        <div className="hero-inner">
          <h1>General Q&A — Ask, Answer, Discover</h1>
          <p className="lead">A friendly, community-driven platform to ask general questions, share knowledge, and learn from others.</p>
          <div className="hero-actions">
            <Link href="/add-product">
              <button className="btn-primary">Ask a Question</button>
            </Link>
            <Link href="/share-problem">
              <button className="btn-secondary">Share a Problem</button>
            </Link>
            <Link href="/catalog">
              <button className="btn-outline">Browse Categories</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Ask Anything</h3>
          <p>Post questions on any topic and get answers from the community.</p>
        </div>
        <div className="feature">
          <h3>Share Knowledge</h3>
          <p>Provide helpful answers and build your reputation.</p>
        </div>
        <div className="feature">
          <h3>Discover Topics</h3>
          <p>Explore categories, follow topics, and find curated content.</p>
        </div>
      </section>

      <section className="cta">
        <h2>Join the community</h2>
        <p>Sign up or log in to start asking and answering questions.</p>
        <div>
          {user ? (
            <Link href="/profile"><button className="btn-primary">Go to Profile</button></Link>
          ) : (
            <>
              <Link href="/signup"><button className="btn-primary">Sign Up</button></Link>
              <Link href="/login"><button className="btn-outline">Log In</button></Link>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .hero {
          background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          color: white;
          padding: 4rem 1rem;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }
        .hero h1 { font-size: 2.4rem; margin-bottom: 0.5rem; }
        .lead { font-size: 1.1rem; margin-bottom: 1rem; }
        .hero-actions { display: flex; gap: 1rem; justify-content: center; }
        .features { display: flex; gap: 1.5rem; margin-top: 2rem; justify-content: center; }
        .feature { background: #fff; padding: 1.2rem; border-radius: 12px; width: 300px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .feature h3 { margin-bottom: 0.5rem; }
        .cta { text-align: center; margin-top: 2.5rem; }
        .btn-primary { background: #667eea; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; cursor: pointer; }
        .btn-outline { background: transparent; border: 1px solid #667eea; color: #667eea; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
}