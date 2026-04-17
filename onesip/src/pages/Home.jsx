import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsletterCRM from '../components/NewsletterCRM';

export default function Home() {
  // Engagement Feature: Floating Promo State
  const [promoVisible, setPromoVisible] = useState(true);
  
  // Engagement Feature: Interactive Product Matcher
  const [activeGoal, setActiveGoal] = useState('energy');

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const trendingProducts = [
    {
      img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop',
      icon: '🍵', badge: '🔥 Best Seller', name: 'Detox Green Tea', price: '₹249',
    },
    {
      img: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=600&q=80&auto=format&fit=crop',
      icon: '💪', badge: 'High Protein', name: 'Protein Power Shake', price: '₹499',
    },
    {
      img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80&auto=format&fit=crop',
      icon: '☕', badge: '⚡ Energy Boost', name: 'Cold Brew Coffee', price: '₹329',
    },
    {
      img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80&auto=format&fit=crop',
      icon: '💧', badge: 'Hydration Essential', name: 'Vitamin Infused Water', price: '₹199',
    },
  ];

  // Data for the Interactive Matcher
  const matchData = {
    energy: {
      title: "Cold Brew Arabica",
      desc: "A 14-hour steep for ultra-smooth, jitter-free focus to crush your workday.",
      img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80&auto=format&fit=crop"
    },
    detox: {
      title: "Matcha Cleanse",
      desc: "Loaded with antioxidants to flush toxins and reset your system overnight.",
      img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop"
    },
    recovery: {
      title: "Whey Isolate Pro",
      desc: "24g of pure, fast-absorbing protein to rebuild muscle right after the gym.",
      img: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=600&q=80&auto=format&fit=crop"
    }
  };

  return (
    <main>
      <style>{`
        :root {
          --orb-sage: rgba(122,140,110,0.18);
          --orb-gold: rgba(201,169,110,0.12);
          --marquee-bg: rgba(201,169,110,0.04);
          --popular-bg: rgba(122,140,110,0.04);
          --shadow: rgba(0,0,0,0.4);
        }
        [data-theme="light"] {
          --orb-sage: rgba(80,110,70,0.1);
          --orb-gold: rgba(154,112,56,0.1);
          --marquee-bg: rgba(154,112,56,0.05);
          --popular-bg: rgba(80,110,70,0.05);
          --shadow: rgba(0,0,0,0.1);
        }

        /* ── FLOATING PROMO (Marketing CTA) ── */
        .floating-promo {
          position: fixed; bottom: 2rem; left: 2rem; z-index: 100;
          background: var(--gold); color: var(--ink);
          padding: 1.2rem 1.5rem; border-radius: 8px;
          box-shadow: 0 15px 35px rgba(201,169,110,0.25);
          display: flex; flex-direction: column; gap: 0.5rem;
          max-width: 280px; animation: slideInLeft 0.6s 1.5s both cubic-bezier(0.23,1,0.32,1);
        }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        .promo-header { display: flex; justify-content: space-between; align-items: center; }
        .promo-header strong { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; }
        .promo-close { background: none; border: none; color: var(--ink); cursor: pointer; font-size: 1.2rem; line-height: 1; opacity: 0.6; transition: opacity 0.2s; }
        .promo-close:hover { opacity: 1; }
        .promo-text { font-size: 0.85rem; line-height: 1.4; font-family: 'DM Sans', sans-serif; }
        .promo-code { display: inline-block; background: var(--ink); color: var(--gold); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; letter-spacing: 0.1em; margin-top: 0.4rem; font-size: 0.75rem; }

        /* ── HERO ── */
        .hero {
          min-height: calc(100vh - 80px);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 6rem 4rem 6rem;
        }
        .hero::before { content:''; position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle, var(--orb-sage) 0%, transparent 70%); top:-15%; left:-10%; animation:drift 12s ease-in-out infinite alternate; pointer-events:none; }
        .hero::after  { content:''; position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle, var(--orb-gold) 0%, transparent 70%); bottom:0; right:5%; animation:drift 15s ease-in-out infinite alternate-reverse; pointer-events:none; }
        @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,30px) scale(1.1)} }

        .hero-content { text-align:center; max-width:960px; position:relative; z-index:1; animation:fadeUp 1.2s cubic-bezier(0.23,1,0.32,1) forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }

        .hero-eyebrow { display:inline-flex; align-items:center; gap:0.8rem; font-size:0.8rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--gold); margin-bottom:2rem; animation:fadeUp 1s 0.2s both; }
        .hero-eyebrow span { display:block; width:30px; height:1px; background:var(--gold); }

        .hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(4rem,8.5vw,8rem); font-weight:300; line-height:1.05; letter-spacing:-0.01em; margin-bottom:1.8rem; animation:fadeUp 1s 0.35s both; }
        .hero h1 em { font-style:italic; color:var(--gold); }

        .hero-sub { font-size:1.15rem; line-height:1.85; color:var(--text-dim); max-width:610px; margin:0 auto 3rem; animation:fadeUp 1s 0.5s both; }

        .hero-buttons { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; animation:fadeUp 1s 0.65s both; }

        .btn-primary { background:var(--gold); color:var(--ink); padding:1rem 2.6rem; border-radius:100px; text-decoration:none; font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase; font-weight:500; transition:transform 0.3s,box-shadow 0.3s,background 0.3s; cursor:pointer; display:inline-block; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(201,169,110,0.35); background:var(--gold-hover); }
        .btn-secondary { border:1px solid var(--border); color:var(--cream); padding:1rem 2.6rem; border-radius:100px; text-decoration:none; font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase; transition:border-color 0.3s,background 0.3s,transform 0.3s; cursor:pointer; backdrop-filter:blur(10px); display:inline-block; }
        .btn-secondary:hover { border-color:var(--gold); background:var(--glass); transform:translateY(-2px); }

        .hero-img-strip { display:flex; gap:0.6rem; justify-content:center; margin-top:3.5rem; animation:fadeUp 1s 0.8s both; }
        .hero-img-pill { width:140px; height:56px; border-radius:100px; overflow:hidden; border:1px solid var(--border); flex-shrink:0; position:relative; }
        .hero-img-pill img { width:100%; height:100%; object-fit:cover; filter:saturate(0.7) brightness(0.85); transition:filter 0.4s; }
        .hero-img-pill:hover img { filter:saturate(1) brightness(0.95); }

        .scroll-cue { position:absolute; bottom:2.5rem; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:0.5rem; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dimmer); animation:fadeUp 1s 1.2s both; }
        .scroll-cue-line { width:1px; height:50px; background:linear-gradient(to bottom,rgba(201,169,110,0.6),transparent); animation:scrollPulse 2s ease-in-out infinite; }
        @keyframes scrollPulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.2)} }

        /* ── MARQUEE ── */
        .marquee-wrap { overflow:hidden; border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:1.3rem 0; background:var(--marquee-bg); }
        .marquee { display:flex; gap:3rem; animation:marquee 25s linear infinite; white-space:nowrap; }
        .marquee-item { font-family:'Cormorant Garamond',serif; font-size:1rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold); opacity:0.8; display:flex; align-items:center; gap:1.5rem; }
        .marquee-item::after { content:'◆'; font-size:0.4rem; color:var(--sage); }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* ── SHARED ── */
        .section-label { font-size:0.74rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--sage); margin-bottom:1rem; display:block; }
        .section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,4.5vw,4.2rem); font-weight:300; line-height:1.1; margin-bottom:1rem; }
        .section-title em { font-style:italic; color:var(--gold); }

        /* ── BRAND STRIP ── */
        .brand-strip { border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:3.5rem 4rem; display:flex; align-items:center; justify-content:space-between; gap:2rem; max-width:1300px; margin:0 auto; }
        .brand-strip-label { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dimmer); flex-shrink:0; }
        .brand-logos { display:flex; align-items:center; gap:3rem; flex-wrap:wrap; justify-content:center; }
        .brand-logo-item { font-family:'Cormorant Garamond',serif; font-size:1.1rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-dimmer); opacity:0.45; transition:opacity 0.3s; }
        .brand-logo-item:hover { opacity:0.9; }

        /* ── FEATURES ── */
        .features-wrap { max-width:1300px; margin:0 auto; padding:8rem 4rem; }
        .features-header { display:grid; grid-template-columns:1fr 1fr; align-items:end; gap:2rem; margin-bottom:5rem; padding-bottom:3rem; border-bottom:1px solid var(--border); }
        .features-desc { color:var(--text-dim); line-height:1.9; font-size:1rem; max-width:420px; margin-left:auto; }
        .feature-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border:1px solid var(--border); }
        .feature-card { background:var(--card-bg); padding:3rem 2.5rem; position:relative; overflow:hidden; transition:background 0.4s; }
        .feature-card::before { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(to right,transparent,var(--gold),transparent); transform:scaleX(0); transform-origin:center; transition:transform 0.5s; }
        .feature-card:hover { background:var(--card-hover); }
        .feature-card:hover::before { transform:scaleX(1); }
        .feature-num { font-family:'Cormorant Garamond',serif; font-size:3.8rem; color:var(--gold); opacity:0.12; font-weight:300; line-height:1; margin-bottom:2rem; transition:opacity 0.4s; }
        .feature-card:hover .feature-num { opacity:0.28; }
        .feature-card h3 { font-family:'Cormorant Garamond',serif; font-size:1.55rem; font-weight:400; margin-bottom:1rem; }
        .feature-card p { color:var(--text-dim); font-size:0.94rem; line-height:1.85; }

        /* ── INTERACTIVE FINDER (Engagement Feature) ── */
        .interactive-section { padding: 6rem 4rem; background: var(--popular-bg); border-top: 1px solid var(--border); }
        .interactive-inner { max-width: 1000px; margin: 0 auto; text-align: center; }
        .match-controls { display: flex; justify-content: center; gap: 1rem; margin: 3rem 0; flex-wrap: wrap; }
        .match-btn { background: var(--glass); border: 1px solid var(--border); color: var(--text-dim); padding: 1rem 2rem; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
        .match-btn:hover { border-color: var(--gold); color: var(--cream); }
        .match-btn.active { background: var(--gold); color: var(--ink); border-color: var(--gold); }
        .match-result { display: flex; align-items: center; gap: 3rem; background: var(--card-bg); border: 1px solid var(--border); padding: 2rem; border-radius: 12px; text-align: left; }
        .match-result-img { width: 200px; height: 200px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
        .match-result-info h3 { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: var(--gold); margin-bottom: 1rem; }
        .match-result-info p { color: var(--text-dim); line-height: 1.8; margin-bottom: 2rem; }

        /* ── EDITORIAL BANNER ── */
        .editorial-banner { position:relative; overflow:hidden; height:520px; margin:0; }
        .editorial-banner-img { width:100%; height:100%; object-fit:cover; filter:brightness(0.35) saturate(0.5); }
        .editorial-banner-overlay { position:absolute; inset:0; display:flex; align-items:center; padding:0 8rem; background:linear-gradient(to right, rgba(13,13,10,0.7) 0%, transparent 70%); }
        .editorial-banner-content { max-width:600px; }
        .editorial-tag { display:inline-block; font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--sage); border:1px solid rgba(122,140,110,0.4); padding:0.3rem 0.8rem; border-radius:100px; margin-bottom:1.5rem; }
        .editorial-banner h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(2.5rem,4vw,4rem); font-weight:300; line-height:1.1; color:#f5f0e8; margin-bottom:1rem; }
        .editorial-banner h2 em { font-style:italic; color:var(--gold); }
        .editorial-banner p { font-size:1rem; color:rgba(245,240,232,0.6); line-height:1.8; margin-bottom:2rem; }

        /* ── PRODUCTS ── */
        .popular { background:var(--popular-bg); }
        .popular-inner { max-width:1300px; margin:0 auto; padding:8rem 4rem; }
        .popular-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:4rem; }
        .popular-header a { font-size:0.8rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--gold); text-decoration:none; border-bottom:1px solid rgba(201,169,110,0.4); padding-bottom:2px; transition:border-color 0.3s; cursor:pointer; }
        .popular-header a:hover { border-color:var(--gold); }
        .product-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }

        .product-card { border:1px solid var(--border); background:var(--glass); position:relative; overflow:hidden; transition:transform 0.4s cubic-bezier(0.23,1,0.32,1), border-color 0.4s, box-shadow 0.4s; cursor:pointer; text-decoration:none; color:inherit; display:flex; flex-direction:column; }
        .product-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, rgba(201,169,110,0.08),transparent 70%); opacity:0; transition:opacity 0.4s; z-index:1; pointer-events:none; }
        .product-card:hover { transform:translateY(-8px); border-color:rgba(201,169,110,0.5); box-shadow:0 30px 60px var(--shadow),0 0 0 1px rgba(201,169,110,0.15); }
        .product-card:hover::before { opacity:1; }
        .product-card-img { width:100%; height:200px; overflow:hidden; position:relative; flex-shrink:0; }
        .product-card-img img { width:100%; height:100%; object-fit:cover; filter:saturate(0.75) brightness(0.88); transition:transform 0.7s cubic-bezier(0.23,1,0.32,1),filter 0.5s; }
        .product-card:hover .product-card-img img { transform:scale(1.07); filter:saturate(1) brightness(0.95); }
        .product-card-img::after { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,transparent 45%,var(--card-bg, #0d0d0a) 100%); pointer-events:none; }
        .product-card-body { padding:1.8rem 2rem 2.2rem; display:flex; flex-direction:column; flex:1; }
        .product-icon { font-size:2.8rem; display:block; margin-bottom:1.8rem; }
        .product-badge { display:inline-block; font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--sage); border:1px solid rgba(122,140,110,0.3); padding:0.3rem 0.7rem; border-radius:100px; margin-bottom:1.2rem; }
        .product-card h3 { font-family:'Cormorant Garamond',serif; font-size:1.6rem; font-weight:400; margin-bottom:0.5rem; }
        .product-price { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:300; color:var(--gold); margin-bottom:1.2rem; display:block; margin-top:auto; padding-top:1rem; }
        .product-cta { display:flex; align-items:center; gap:0.5rem; font-size:0.78rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-dimmer); transition:color 0.3s; }
        .product-cta svg { transition:transform 0.3s; }
        .product-card:hover .product-cta { color:var(--gold); }
        .product-card:hover .product-cta svg { transform:translateX(4px); }

        /* ── STATS ── */
        .stats { border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .stats-inner { max-width:1300px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); }
        .stat-item { padding:5rem 3rem; text-align:center; }
        .stat-item + .stat-item { border-left:1px solid var(--border); }
        .stat-num { font-family:'Cormorant Garamond',serif; font-size:clamp(3rem,5vw,5.5rem); font-weight:300; line-height:1; margin-bottom:0.8rem; display:block; color:var(--cream); }
        .stat-num span { color:var(--gold); }
        .stat-label { font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dimmer); }

        /* ── PROMISE SECTION ── */
        .promise-section { padding:8rem 4rem; max-width:1300px; margin:0 auto; }
        .promise-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid var(--border); }
        .promise-img-col { position:relative; overflow:hidden; min-height:480px; }
        .promise-img-col img { width:100%; height:100%; object-fit:cover; filter:saturate(0.6) brightness(0.7); transition:filter 0.6s; }
        .promise-img-col:hover img { filter:saturate(0.8) brightness(0.8); }
        .promise-img-overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(13,13,10,0.5),transparent); }
        .promise-img-badge { position:absolute; bottom:2rem; left:2rem; font-family:'Cormorant Garamond',serif; font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(245,240,232,0.6); border:1px solid rgba(245,240,232,0.2); padding:0.5rem 1rem; backdrop-filter:blur(10px); }
        .promise-content-col { padding:5rem 4rem; display:flex; flex-direction:column; justify-content:center; border-left:1px solid var(--border); }
        .promise-content-col blockquote { font-family:'Cormorant Garamond',serif; font-size:clamp(1.6rem,2.5vw,2.2rem); font-weight:300; font-style:italic; line-height:1.55; color:var(--text-dim); margin-bottom:2.5rem; border:none; padding:0; }
        .promise-content-col blockquote strong { color:var(--cream); font-style:normal; font-weight:400; }
        .promise-author { display:flex; flex-direction:column; gap:0.3rem; }
        .promise-author-name { font-size:0.82rem; font-weight:500; letter-spacing:0.08em; color:var(--cream); }
        .promise-author-title { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dimmer); }

        /* REVEAL */
        .reveal { opacity:0; transform:translateY(30px); transition:opacity 0.9s cubic-bezier(0.23,1,0.32,1),transform 0.9s cubic-bezier(0.23,1,0.32,1); }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-delay-1 { transition-delay:0.1s; }
        .reveal-delay-2 { transition-delay:0.2s; }
        .reveal-delay-3 { transition-delay:0.3s; }
        .reveal-delay-4 { transition-delay:0.4s; }

        /* RESPONSIVE */
        @media (max-width:900px) {
          .features-wrap, .popular-inner, .promise-section, .interactive-section { padding:5rem 2rem; }
          .features-header, .promise-grid { grid-template-columns:1fr; }
          .promise-img-col { min-height:280px; }
          .promise-content-col { border-left:none; border-top:1px solid var(--border); padding:3rem 2rem; }
          .feature-grid { grid-template-columns:1fr 1fr; }
          .product-grid { grid-template-columns:1fr 1fr; }
          .stats-inner { grid-template-columns:1fr; }
          .stat-item + .stat-item { border-left:none; border-top:1px solid var(--border); }
          .hero { padding:8rem 2rem 5rem; }
          .hero-img-strip { display:none; }
          .editorial-banner-overlay { padding:0 3rem; }
          .brand-strip { padding:2.5rem 2rem; flex-direction:column; align-items:flex-start; gap:1.5rem; }
          .match-result { flex-direction: column; text-align: center; }
        }
        @media (max-width:560px) {
          .feature-grid { grid-template-columns:1fr; }
          .product-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Engagement Feature: Floating Promo Badge */}
      {promoVisible && (
        <aside className="floating-promo">
          <div className="promo-header">
            <strong>Welcome to OneSip</strong>
            <button className="promo-close" onClick={() => setPromoVisible(false)} aria-label="Close promo">×</button>
          </div>
          <div className="promo-text">Get 15% off your first subscription plan today!</div>
          <span className="promo-code">CODE: SIP15</span>
        </aside>
      )}

      {/* ── HERO ── */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span></span>Premium Wellness Beverages<span></span>
          </div>
          <h1>Where Health<br />Meets <em>Hydration</em></h1>
          <p className="hero-sub">Discover premium juices, detox drinks, teas, coffees, smoothies, protein shakes, and wellness beverages — all in one place.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">Shop Now</Link>
            <Link to="/subscription" className="btn-secondary">Explore Plans</Link>
          </div>
          <div className="hero-img-strip">
            {[
              'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=70&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=70&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=300&q=70&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&q=70&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=300&q=70&auto=format&fit=crop',
            ].map((src, i) => (
              <div className="hero-img-pill" key={i}>
                <img src={src} alt="" aria-hidden="true" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        <div className="scroll-cue">
          <div className="scroll-cue-line"></div>
          Scroll
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee">
          {['Detox Teas','Protein Shakes','Cold Brew Coffee','Vitamin Water','Green Smoothies','Kombucha','Herbal Infusions','Adaptogen Blends',
            'Detox Teas','Protein Shakes','Cold Brew Coffee','Vitamin Water','Green Smoothies','Kombucha','Herbal Infusions','Adaptogen Blends'].map((t,i) => (
            <div className="marquee-item" key={i}>{t}</div>
          ))}
        </div>
      </div>

      {/* ── BRAND TRUST STRIP ── */}
      <section className="brand-strip reveal" aria-label="Brands that trust us">
        <span className="brand-strip-label">Trusted by</span>
        <div className="brand-logos">
          {['Himalaya','Tetley','Blue Tokai','Raw Pressery','Yoga Bar','ID Fresh','Epigamia','Jimmy\'s Cocktails'].map((b,i) => (
            <span className="brand-logo-item" key={i}>{b}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-wrap">
        <div className="features-header reveal">
          <div>
            <span className="section-label">Why OneSip</span>
            <h2 className="section-title">Crafted for the<br /><em>Conscious Consumer</em></h2>
          </div>
          <p className="features-desc">We believe what you drink is as important as what you eat. Every product on OneSip is selected for quality, transparency, and genuine wellness value.</p>
        </div>
        <div className="feature-grid">
          {[
            {n:'01', t:'100+ Beverage Brands', p:'From organic teas to protein shakes, we offer a curated selection of the world\'s most trusted brands.'},
            {n:'02', t:'Health-Based Filters', p:'Filter by sugar-free, protein-rich, vegan, detox & more — find exactly what your body needs.'},
            {n:'03', t:'Smart Recommendations', p:'Personalized suggestions based on your browsing & purchase behavior. Your wellness, your way.'},
            {n:'04', t:'Subscription Savings', p:'Save up to 15% with monthly hydration plans delivered directly to your doorstep, hassle-free.'},
          ].map(({n,t,p},i) => (
            <article className={`feature-card reveal reveal-delay-${i+1}`} key={n}>
              <div className="feature-num" aria-hidden="true">{n}</div>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Engagement Feature: INTERACTIVE PRODUCT MATCHER */}
      <section className="interactive-section reveal">
        <div className="interactive-inner">
          <span className="section-label">Personalized for you</span>
          <h2 className="section-title">Find Your Perfect <em>Sip</em></h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '1rem' }}>Select your goal for today to see our top recommendation.</p>
          
          <div className="match-controls">
            <button className={`match-btn ${activeGoal === 'energy' ? 'active' : ''}`} onClick={() => setActiveGoal('energy')}>I need Focus & Energy</button>
            <button className={`match-btn ${activeGoal === 'detox' ? 'active' : ''}`} onClick={() => setActiveGoal('detox')}>I want to Cleanse & Detox</button>
            <button className={`match-btn ${activeGoal === 'recovery' ? 'active' : ''}`} onClick={() => setActiveGoal('recovery')}>I need Muscle Recovery</button>
          </div>

          <div className="match-result">
            <img className="match-result-img" src={matchData[activeGoal].img} alt={matchData[activeGoal].title} loading="lazy" />
            <div className="match-result-info">
              <h3>{matchData[activeGoal].title}</h3>
              <p>{matchData[activeGoal].desc}</p>
              <Link to="/products" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Shop This Item</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL BANNER ── */}
      <section className="editorial-banner reveal" aria-label="Seasonal Collection Promo">
        <img
          className="editorial-banner-img"
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80&auto=format&fit=crop"
          alt="Fresh organic ingredients on a wooden table"
          loading="lazy"
        />
        <div className="editorial-banner-overlay">
          <div className="editorial-banner-content">
            <span className="editorial-tag">Seasonal Collection</span>
            <h2>Hydration<br />Elevated to an <em>Art Form</em></h2>
            <p>Premium wellness beverages sourced from certified organic farms and artisan producers across India and beyond.</p>
            <Link to="/products" className="btn-primary">Explore the Range</Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ── */}
      <section className="popular" aria-labelledby="trending-heading">
        <div className="popular-inner">
          <div className="popular-header reveal">
            <div>
              <span className="section-label">Trending</span>
              <h2 id="trending-heading" className="section-title">This Week's <em>Favourites</em></h2>
            </div>
            <Link to="/products">View all products →</Link>
          </div>
          <div className="product-grid">
            {trendingProducts.map((p, i) => (
              <Link to="/products" className={`product-card reveal reveal-delay-${i+1}`} key={p.name}>
                <div className="product-card-img">
                  <img src={p.img} alt={p.name} loading="lazy" />
                </div>
                <div className="product-card-body">
                  <span className="product-badge">{p.badge}</span>
                  <h3>{p.name}</h3>
                  <span className="product-price">{p.price}</span>
                  <div className="product-cta">
                    View Details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMISE SPLIT ── */}
      <section className="promise-section reveal">
        <div className="promise-grid">
          <div className="promise-img-col">
            <img
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80&auto=format&fit=crop"
              alt="Person holding a healthy green beverage"
              loading="lazy"
            />
            <div className="promise-img-overlay"></div>
            <span className="promise-img-badge">The OneSip Standard</span>
          </div>
          <div className="promise-content-col">
            <blockquote>
              "We believe the drinks you choose are as important as the food you eat. <strong>Every sip is a decision about your health.</strong>"
            </blockquote>
            <div className="promise-author">
              <span className="promise-author-name">The OneSip Team</span>
              <span className="promise-author-title">Founding Principle, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats" aria-label="Company Statistics">
        <div className="stats-inner">
          <div className="stat-item reveal">
            <span className="stat-num">25,000<span>+</span></span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-item reveal reveal-delay-1">
            <span className="stat-num">75<span>+</span></span>
            <span className="stat-label">Beverage Partners</span>
          </div>
          <div className="stat-item reveal reveal-delay-2">
            <span className="stat-num">4.8<span>★</span></span>
            <span className="stat-label">Customer Rating</span>
          </div>
        </div>
      </section>

      {/* CRM Newsletter (Lead Capture) */}
      <NewsletterCRM />
    </main>
  );
}