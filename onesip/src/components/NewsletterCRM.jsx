import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function NewsletterCRM() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !name) return;
    setStatus('loading');
    try {
      await addDoc(collection(db, 'marketing_leads'), {
        name,
        email,
        source: 'Homepage Newsletter Form',
        subscribedAt: new Date().toISOString(),
        status: 'Active',
      });
      setStatus('success');
      setEmail('');
      setName('');
    } catch (error) {
      console.error("Error saving lead: ", error);
      setStatus('error');
    }
  };

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-heading">
      <style>{`
        /* ═══════════════════════════════════════════════
           NEWSLETTER — PREMIUM EDITORIAL SECTION
        ═══════════════════════════════════════════════ */

        .newsletter-section {
          padding: 0 4rem 9rem;
        }

        .newsletter-inner {
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--card-bg);
          border-radius: 4px;
        }

        /* Background texture */
        .newsletter-inner::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0.5;
        }

        /* Gold top bar */
        .newsletter-inner::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold) 30%, var(--gold) 70%, transparent);
        }

        /* Ambient orb */
        .news-orb {
          position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%);
          top: -50%; left: 50%; transform: translateX(-50%);
          pointer-events: none;
          animation: newsOrb 10s ease-in-out infinite alternate;
        }
        @keyframes newsOrb { from{transform:translateX(-50%) scale(1)} to{transform:translateX(-50%) scale(1.15)} }

        .newsletter-content {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          min-height: 340px;
        }

        /* LEFT: Copy */
        .news-copy {
          padding: 5rem 4rem 5rem;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; justify-content: center;
        }

        .news-eyebrow {
          display: inline-flex; align-items: center; gap: 1rem;
          font-size: 0.7rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--gold); opacity: 0.8; margin-bottom: 1.5rem;
        }
        .news-eyebrow-line { display: block; width: 28px; height: 1px; background: var(--gold); opacity: 0.5; }

        .news-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 3.5vw, 3.5rem);
          font-weight: 300; line-height: 1.1;
          color: var(--cream); margin: 0 0 1.2rem;
        }
        .news-title em { font-style: italic; color: var(--gold); }

        .news-desc {
          font-size: 0.95rem; color: var(--text-dim);
          line-height: 1.85; margin: 0; font-weight: 300;
          max-width: 380px;
        }

        .news-perks {
          display: flex; flex-direction: column; gap: 0.7rem;
          margin-top: 2rem;
        }
        .news-perk {
          display: flex; align-items: center; gap: 0.8rem;
          font-size: 0.82rem; color: var(--text-dim);
        }
        .perk-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--gold); opacity: 0.6; flex-shrink: 0;
        }

        /* RIGHT: Form */
        .news-form-col {
          padding: 5rem 4rem;
          display: flex; flex-direction: column; justify-content: center;
        }

        /* SUCCESS STATE */
        .news-success {
          text-align: center;
          animation: successIn 0.6s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes successIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }

        .success-check {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(122,140,110,0.12);
          border: 1px solid var(--sage);
          color: var(--sage);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; margin: 0 auto 1.5rem;
        }
        .success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 300; color: var(--cream);
          margin-bottom: 0.5rem;
        }
        .success-title em { font-style: italic; color: var(--sage); }
        .success-desc {
          font-size: 0.88rem; color: var(--text-dim);
          margin-bottom: 1.8rem; line-height: 1.7;
        }
        .promo-code-box {
          display: inline-flex; flex-direction: column; align-items: center;
          gap: 0.5rem; padding: 1.2rem 2rem;
          border: 1px dashed var(--gold);
          background: rgba(201,169,110,0.04);
          border-radius: 4px;
        }
        .promo-label {
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); opacity: 0.8;
        }
        .promo-code {
          font-family: 'Courier New', monospace;
          font-size: 1.8rem; letter-spacing: 0.25em;
          color: var(--gold); font-weight: bold;
        }
        .promo-note {
          font-size: 0.78rem; color: var(--text-dimmer);
          margin-top: 1rem; line-height: 1.5;
        }

        /* FORM */
        .news-form-group {
          margin-bottom: 1.2rem;
        }
        .news-form-label {
          font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--text-dimmer); display: block; margin-bottom: 0.6rem;
          transition: color 0.3s;
        }
        .news-form-label.active { color: var(--gold); }

        .news-input-wrap {
          display: flex; gap: 0;
          border: 1px solid var(--border);
          transition: border-color 0.3s;
          background: var(--glass);
        }
        .news-input-wrap.focused { border-color: var(--gold); }

        .news-input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 300;
          padding: 1rem 1.2rem; width: 100%;
        }
        .news-input::placeholder { color: var(--text-dimmer); opacity: 0.6; }

        .news-btn {
          width: 100%;
          background: var(--gold); color: var(--ink); border: none;
          padding: 1.2rem 2rem; margin-top: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.16em;
          text-transform: uppercase; font-weight: 500;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .news-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.4s;
        }
        .news-btn:hover:not(:disabled)::before { left: 100%; }
        .news-btn:hover:not(:disabled) { background: var(--gold-hover); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(201,169,110,0.2); }
        .news-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .news-fine {
          font-size: 0.75rem; color: var(--text-dimmer);
          line-height: 1.6; margin-top: 1rem; text-align: center;
        }
        .news-error {
          font-size: 0.78rem; color: #c97070;
          margin-top: 0.8rem; text-align: center;
        }

        @media (max-width: 900px) {
          .newsletter-section { padding: 0 2rem 7rem; }
          .newsletter-content { grid-template-columns: 1fr; }
          .news-copy { border-right: none; border-bottom: 1px solid var(--border); padding: 3.5rem 3rem; }
          .news-form-col { padding: 3rem 3rem 4rem; }
        }
        @media (max-width: 600px) {
          .news-copy, .news-form-col { padding: 3rem 2rem; }
        }
      `}</style>

      <div className="newsletter-inner">
        <div className="news-orb"></div>
        <div className="newsletter-content">

          {/* LEFT: Copy */}
          <div className="news-copy">
            <div className="news-eyebrow">
              <span className="news-eyebrow-line"></span>
              Inner Circle
              <span className="news-eyebrow-line"></span>
            </div>
            <h2 id="newsletter-heading" className="news-title">
              Unlock<br />Exclusive <em>Perks</em>
            </h2>
            <p className="news-desc">
              Join thousands of wellness enthusiasts who get early access to new blends, seasonal drops, and insider tips.
            </p>
            <div className="news-perks">
              {[
                'Instant 15% off your first order',
                'Early access to new product launches',
                'Seasonal wellness guides & recipes',
                'Members-only flash sales',
              ].map((perk, i) => (
                <div className="news-perk" key={i}>
                  <span className="perk-dot"></span>
                  {perk}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Form / Success */}
          <div className="news-form-col">
            {status === 'success' ? (
              <div className="news-success" role="alert">
                <div className="success-check">✓</div>
                <div className="success-title">Welcome, <em>{name}!</em></div>
                <p className="success-desc">
                  You're in. Use this code at checkout for 15% off your first order:
                </p>
                <div className="promo-code-box">
                  <span className="promo-label">Your Promo Code</span>
                  <span className="promo-code">SIP15</span>
                </div>
                <p className="promo-note">Valid for 30 days. One use per customer.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate>
                
                {/* ── NEW FIRST NAME FIELD ── */}
                <div className="news-form-group">
                  <label htmlFor="lead-name" className={`news-form-label ${focusedInput === 'name' ? 'active' : ''}`}>
                    First Name
                  </label>
                  <div className={`news-input-wrap ${focusedInput === 'name' ? 'focused' : ''}`}>
                    <input
                      id="lead-name"
                      type="text"
                      className="news-input"
                      placeholder="Jane"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                      required
                    />
                  </div>
                </div>

                {/* ── EMAIL FIELD ── */}
                <div className="news-form-group">
                  <label htmlFor="lead-email" className={`news-form-label ${focusedInput === 'email' ? 'active' : ''}`}>
                    Email Address
                  </label>
                  <div className={`news-input-wrap ${focusedInput === 'email' ? 'focused' : ''}`}>
                    <input
                      id="lead-email"
                      type="email"
                      className="news-input"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="news-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Joining…' : 'Unlock My 15% Off'}
                </button>

                <p className="news-fine">
                  No spam, ever. Unsubscribe anytime with one click. By subscribing you agree to our Privacy Policy.
                </p>
                
                {status === 'error' && (
                  <p className="news-error" role="alert">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}