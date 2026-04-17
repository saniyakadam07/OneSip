import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function Support() {
  const { currentUser } = useAuth();
  
  // Form State
  const [ticketType, setTicketType] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'support_tickets'), {
        userEmail: currentUser ? currentUser.email : 'Guest',
        userId: currentUser ? currentUser.uid : null,
        type: ticketType,
        subject,
        message,
        serviceRating: rating,
        status: 'Open',
        createdAt: new Date().toISOString()
      });
      
      setTicketId(docRef.id);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ Data
  const faqs = [
    { q: "How long does shipping take?", a: "Standard shipping takes 2-3 business days. All orders over ₹499 receive free expedited handling." },
    { q: "Can I return a Drink Lab custom mix?", a: "Because Build-To-Order (BTO) drinks are custom-made for your specific wellness goals, we cannot accept returns on them. Standard retail products can be returned within 7 days if sealed." },
    { q: "Where is my order?", a: "Once your order is processed by our ERP system, you will receive a live tracking link via email." },
    { q: "How are taxes calculated?", a: "We apply a standard 18% GST to our health supplements and wellness blends, calculated at checkout." }
  ];

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════
            SUPPORT PAGE — PREMIUM EDITORIAL
         ═══════════════════════════════════════════════ */

        .support-page {
          min-height: calc(100vh - 80px);
          max-width: 1300px;
          margin: 0 auto;
          padding: 6rem 4rem 8rem;
          animation: fadeUp 0.9s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        /* Header */
        .support-header { margin-bottom: 4rem; padding-bottom: 2.5rem; border-bottom: 1px solid var(--border); }
        .support-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem;
          font-size: 0.7rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--sage); margin-bottom: 1rem;
        }
        .support-eyebrow-line { display: block; width: 24px; height: 1px; background: var(--sage); }
        .support-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 300; line-height: 1.05; margin: 0 0 1rem;
        }
        .support-header h1 em { font-style: italic; color: var(--gold); }
        .support-header p { color: var(--text-dim); font-size: 1.05rem; max-width: 600px; line-height: 1.6; margin: 0; }

        /* Grid */
        .support-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 5rem;
          align-items: start;
        }

        /* FAQ Section */
        .faq-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300; margin: 0 0 2rem;
        }
        .faq-item {
          border-bottom: 1px solid var(--border);
          padding: 1.5rem 0;
        }
        .faq-item:first-of-type { border-top: 1px solid var(--border); }
        .faq-q {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 500; color: var(--cream);
          margin-bottom: 0.8rem; display: block;
        }
        .faq-a {
          font-size: 0.85rem; color: var(--text-dimmer); line-height: 1.7; margin: 0;
        }
        .contact-info {
          margin-top: 3rem; padding: 2rem;
          background: rgba(201,169,110,0.03);
          border: 1px solid rgba(201,169,110,0.15);
        }
        .contact-info h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 400; color: var(--gold); margin: 0 0 1rem; }
        .contact-info p { font-size: 0.85rem; color: var(--text-dim); margin: 0 0 0.5rem; }

        /* Form Section */
        .support-form-wrap {
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 3.5rem;
          position: relative; overflow: hidden;
        }
        .support-form-wrap::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        
        .form-group { margin-bottom: 1.8rem; }
        .form-label {
          display: block; font-size: 0.7rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--text-dimmer); margin-bottom: 0.8rem;
        }
        
        .form-select, .form-input, .form-textarea {
          width: 100%; background: rgba(245,240,232,0.02);
          border: 1px solid rgba(245,240,232,0.1);
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; padding: 1rem 1.2rem;
          transition: border-color 0.3s, background 0.3s;
          box-sizing: border-box; outline: none;
        }
        .form-select:focus, .form-input:focus, .form-textarea:focus {
          border-color: rgba(201,169,110,0.5); background: rgba(201,169,110,0.02);
        }
        .form-select option { background: var(--ink); color: var(--cream); }
        .form-textarea { resize: vertical; min-height: 120px; }

        /* Star Rating */
        .star-rating { display: flex; gap: 0.5rem; }
        .star {
          font-size: 1.8rem; cursor: pointer; color: rgba(245,240,232,0.15);
          transition: color 0.2s, transform 0.2s;
        }
        .star.active { color: var(--gold); }
        .star:hover { transform: scale(1.1); }

        .btn-submit {
          width: 100%; background: var(--gold); color: var(--ink);
          border: none; padding: 1.2rem; margin-top: 1rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
          letter-spacing: 0.15em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; transition: background 0.3s, transform 0.2s;
        }
        .btn-submit:hover:not(:disabled) { background: var(--gold-hover); transform: translateY(-2px); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Success State */
        .success-state { text-align: center; padding: 2rem 0; }
        .success-icon { font-size: 3.5rem; display: block; margin-bottom: 1.5rem; }
        .success-title { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 300; margin: 0 0 1rem; }
        .success-title em { font-style: italic; color: var(--gold); }
        .ticket-id { font-family: monospace; color: var(--gold); padding: 0.5rem 1rem; background: rgba(201,169,110,0.1); border: 1px dashed rgba(201,169,110,0.3); display: inline-block; margin-top: 1.5rem; }

        @media (max-width: 960px) {
          .support-grid { grid-template-columns: 1fr; gap: 4rem; }
          .support-page { padding: 4rem 2rem 6rem; }
          .support-form-wrap { padding: 2.5rem; }
        }
      `}</style>

      <div className="support-page">
        <div className="support-header">
          <div className="support-eyebrow">
            <span className="support-eyebrow-line"></span>
            Concierge & Support
          </div>
          <h1>How can we <em>help you?</em></h1>
          <p>Whether you have a question about your custom Drink Lab formulation, shipping times, or just want to leave feedback, our concierge team is here.</p>
        </div>

        <div className="support-grid">
          
          {/* LEFT: FAQ & Contact Info */}
          <div className="faq-section">
            <h2>Quick <em>Answers</em></h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <span className="faq-q">{faq.q}</span>
                  <p className="faq-a">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="contact-info">
              <h4>Direct Contact</h4>
              <p><strong>Email:</strong> concierge@onesip.com</p>
              <p><strong>Phone:</strong> 1-800-WELLNESS</p>
              <p><strong>Hours:</strong> Mon - Sat, 9am - 6pm (IST)</p>
            </div>
          </div>

          {/* RIGHT: Interactive Form */}
          <div className="support-form-wrap">
            {submitted ? (
              <div className="success-state">
                <span className="success-icon">✨</span>
                <h2 className="success-title">Request <em>Received</em></h2>
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  Thank you for reaching out. Our concierge team has received your ticket and will respond to {currentUser ? currentUser.email : 'your email'} within 24 hours.
                </p>
                <div className="ticket-id">TICKET ID: #{ticketId.slice(-6).toUpperCase()}</div>
                <button className="btn-submit" style={{ marginTop: '2rem' }} onClick={() => {
                  setSubmitted(false); setSubject(''); setMessage(''); setRating(0);
                }}>
                  Submit Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                
                <div className="form-group">
                  <label className="form-label">How can we help?</label>
                  <select 
                    className="form-select" 
                    value={ticketType} 
                    onChange={(e) => setTicketType(e.target.value)}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Shipping & Handling">Shipping & Handling</option>
                    <option value="Drink Lab / Custom Recipe">Drink Lab / Custom Recipe</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Platform Feedback">Platform Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Briefly describe your issue..." 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Details</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Please provide as much detail as possible..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Rate your OneSip Experience so far</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star}
                        className={`star ${(hoveredRating || rating) >= star ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting || !subject.trim() || !message.trim()}
                >
                  {isSubmitting ? 'Sending to Concierge...' : 'Submit Ticket'}
                </button>
                
                {!currentUser && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dimmer)', marginTop: '1rem', textAlign: 'center' }}>
                    You are submitting as a guest. Please <a href="/login" style={{ color: 'var(--gold)'}}>Log In</a> to track this ticket in your profile.
                  </p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </>
  );
}