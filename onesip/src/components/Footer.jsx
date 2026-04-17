import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site Footer">
      <style>{`
        /* ═══════════════════════════════════════════════
           PREMIUM FAT FOOTER — SEO & ENGAGEMENT
        ═══════════════════════════════════════════════ */
        
        .site-footer {
          background: var(--ink, #0d0d0a);
          border-top: 1px solid var(--border);
          padding: 5rem 4rem 2rem;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
        }

        .footer-inner {
          max-width: 1300px;
          margin: 0 auto;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 5rem;
        }

        /* Brand Column */
        .footer-brand {
          max-width: 320px;
        }
        .footer-logo {
          display: inline-block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-decoration: none;
          margin-bottom: 1rem;
        }
        .footer-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1.2rem;
          color: var(--cream);
          display: block;
          margin-bottom: 1.5rem;
        }
        .footer-desc {
          font-size: 0.85rem;
          line-height: 1.8;
          color: var(--text-dimmer);
        }

        /* Link Columns */
        .footer-col-title {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--cream);
          margin-bottom: 2rem;
          display: block;
        }
        .footer-nav {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .footer-nav a {
          color: var(--text-dimmer);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.3s, transform 0.3s;
          display: inline-block;
        }
        .footer-nav a:hover {
          color: var(--gold);
          transform: translateX(4px);
        }

        /* Footer Bottom */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        .footer-copy {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: var(--text-dimmer);
        }
        
        /* Social Links */
        .footer-socials {
          display: flex;
          gap: 1.5rem;
        }
        .social-link {
          color: var(--text-dimmer);
          text-decoration: none;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .social-link:hover {
          color: var(--gold);
        }

        @media (max-width: 960px) {
          .site-footer { padding: 4rem 2rem 2rem; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 3rem; }
        }
        @media (max-width: 600px) {
          .footer-top { grid-template-columns: 1fr; gap: 2.5rem; }
          .footer-bottom { flex-direction: column; gap: 1.5rem; text-align: center; }
        }
      `}</style>

      <div className="footer-inner">
        <div className="footer-top">
          
          <div className="footer-brand">
            <Link to="/" className="footer-logo">OneSip</Link>
            <span className="footer-tagline">Where Health Meets Hydration</span>
            <p className="footer-desc">
              Curating the world's finest wellness beverages. Elevate your daily hydration routine with our premium, health-focused collection.
            </p>
          </div>

          <nav aria-label="Explore Menu">
            <span className="footer-col-title">Explore</span>
            <ul className="footer-nav">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/subscription">Hydration Plans</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/cart">Your Cart</Link></li>
            </ul>
          </nav>

          <nav aria-label="Support Menu">
            <span className="footer-col-title">Support</span>
            <ul className="footer-nav">
              {/* Converted to React Router Links */}
              <li><Link to="/info/faq">FAQ</Link></li>
              <li><Link to="/info/shipping">Shipping & Returns</Link></li>
              <li><Link to="/info/contact">Contact Us</Link></li>
              <li><Link to="/login">Member Portal</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal Menu">
            <span className="footer-col-title">Legal</span>
            <ul className="footer-nav">
              {/* Converted to React Router Links */}
              <li><Link to="/info/privacy">Privacy Policy</Link></li>
              <li><Link to="/info/terms">Terms of Service</Link></li>
              <li><Link to="/info/refund">Refund Policy</Link></li>
            </ul>
          </nav>

        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} OneSip. All rights reserved.</span>
          <div className="footer-socials" aria-label="Social Media Links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}