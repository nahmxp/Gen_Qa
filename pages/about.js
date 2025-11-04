import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="about-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>About General Q&amp;A</h1>
        <p>Community-powered knowledge sharing — our mission and values</p>
      </div>

      {/* Company Introduction */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <h2>Welcome to General Q&amp;A</h2>
            <p>
              General Q&amp;A is a community-driven platform where anyone can ask questions, provide thoughtful answers, and learn across a broad range of topics. Our focus is on clear, helpful information and respectful, constructive interactions.
            </p>
            <p>
              We aim to make knowledge accessible to everyone by building tools that help people discover, share, and trust useful answers.
            </p>
          </div>
          <div className="about-image">
            <img 
              src="/images/Icon.png" 
              alt="General Q&A" 
              className="rounded-image"
            />
          </div>
        </div>
      </section>
      {/* Highlight: Share a Problem */}
      <section className="share-problem-highlight">
        <div className="highlight-inner">
          <h2>Have a problem that needs attention?</h2>
          <p>If you're facing an issue or a complex problem, share it with the community — you'll get suggestions, approaches, and help from people who care.</p>
          <Link href="/share-problem"><button className="btn-primary">Share a Problem</button></Link>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <div className="mission-statement">
            <p>
              "To empower people around the world to share and access reliable answers to everyday questions — fostering curiosity, learning, and collaboration."
            </p>
          </div>
          <div className="mission-values">
            <div className="value-card">
              <h3>Clarity</h3>
              <p>Clear, well-explained answers that help people solve real problems.</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>Respectful contributions and peer feedback build trust and improve content quality.</p>
            </div>
            <div className="value-card">
              <h3>Openness</h3>
              <p>We welcome diverse perspectives and encourage collaboration across disciplines.</p>
            </div>
            <div className="value-card">
              <h3>Reliability</h3>
              <p>We prioritize accuracy and useful context in every answer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Why General Q&amp;A</h2>
        <div className="team-grid">
          <div className="team-member">
            <h3>Community Driven</h3>
            <p>Answers are contributed by people like you — diverse experience, practical solutions.</p>
          </div>
          <div className="team-member">
            <h3>Quality Content</h3>
            <p>Votes and peer review help highlight the most useful answers.</p>
          </div>
          <div className="team-member">
            <h3>Easy Discovery</h3>
            <p>Categories, tags, and search help you find answers fast.</p>
          </div>
          <div className="team-member">
            <h3>Make an Impact</h3>
            <p>Your contributions help others and build a stronger knowledge base.</p>
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="history-section">
        <h2>How It Works</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-date">1</div>
            <div className="timeline-content">
              <h3>Ask</h3>
              <p>Post a clear question describing the problem or information you need.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">2</div>
            <div className="timeline-content">
              <h3>Answer</h3>
              <p>Community members provide answers, context, and references.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">3</div>
            <div className="timeline-content">
              <h3>Vote &amp; Improve</h3>
              <p>Votes and edits help surface the most helpful content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta-section">
        <div className="cta-content">
          <h2>Get Involved</h2>
          <p>Start asking, answering, and helping build a helpful knowledge base for everyone.</p>
          <div className="cta-buttons">
            <Link href="/add-product">
              <button className="btn-primary">Ask a Question</button>
            </Link>
            <Link href="/contact">
              <button className="btn-outline">Contact Support</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 