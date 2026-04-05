import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function Subscription() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [billing, setBilling] = useState('monthly');
  const [subscribedPlans, setSubscribedPlans] = useState({});
  const [modalData, setModalData] = useState({ isOpen: false, planName: '', icon: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingKey, setProcessingKey] = useState(null);

  const prices = {
    detox:   { monthly: 999,  annual: 799  },
    tea:     { monthly: 799,  annual: 639  },
    fitness: { monthly: 1299, annual: 1039 },
    wellness:{ monthly: 1599, annual: 1279 },
  };

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubscribe = async (planName, icon, key) => {
    // ── THE GUARDRAIL: Redirect guests to login if they try to subscribe ──
    if (!currentUser) {
      navigate('/login?redirect=/subscription');
      return; 
    }

    if (subscribedPlans[key]) return;
    
    setIsProcessing(true);
    setProcessingKey(key);
    
    try {
      const startDate = new Date();
      const nextBillingDate = new Date();
      billing === 'monthly'
        ? nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
        : nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

      await addDoc(collection(db, 'subscriptions'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        planKey: key, planName, billingCycle: billing,
        price: billing === 'annual' ? prices[key].annual * 12 : prices[key].monthly,
        status: 'Active',
        startDate: startDate.toISOString(),
        nextBillingDate: nextBillingDate.toISOString()
      });
      
      setSubscribedPlans(prev => ({ ...prev, [key]: true }));
      setModalData({ isOpen: true, planName, icon });
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingKey(null);
    }
  };

  const closeModal = () => setModalData({ ...modalData, isOpen: false });

  const plans = [
    {
      key: 'detox',
      icon: '🍵',
      name: 'Detox Starter',
      tagline: 'Begin your clean wellness journey',
      featured: false,
      badge: null,
      items: ['8 Cold Pressed Juices', '4 Herbal Teas', '2 Detox Shots', 'Free Delivery', '10% Savings'],
      highlight: [false, false, false, true, true],
    },
    {
      key: 'tea',
      icon: '☕',
      name: 'Tea & Coffee Premium',
      tagline: 'Our bestselling daily ritual blend',
      featured: true,
      badge: 'Most Popular',
      items: ['10 Premium Teas', '5 Specialty Coffees', '3 Adaptogens', 'Free Priority Delivery', '12% Savings'],
      highlight: [false, false, false, true, true],
    },
    {
      key: 'fitness',
      icon: '💪',
      name: 'Fitness Protein Pro',
      tagline: 'Performance fuel for the dedicated',
      featured: false,
      badge: null,
      items: ['12 Protein Shakes', '4 Energy Drinks', '3 Recovery Drinks', 'Nutrition Guide', '15% Savings'],
      highlight: [false, false, false, true, true],
    },
    {
      key: 'wellness',
      icon: '✨',
      name: 'Total Wellness',
      tagline: 'Complete mind-body hydration system',
      featured: false,
      badge: 'New',
      items: ['5 Teas', '4 Juices', '3 Protein Shakes', '3 Adaptogens', 'Wellness Coach', '20% Savings'],
      highlight: [false, false, false, false, true, true],
    },
  ];

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════
           SUBSCRIPTION PAGE — PREMIUM EDITORIAL
        ═══════════════════════════════════════════════ */

        .sub-page { position: relative; overflow-x: hidden; }

        /* Ambient */
        .sub-orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
        }
        .sub-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(122,140,110,0.15) 0%, transparent 70%);
          top: -15%; left: -10%;
          animation: orbDrift 13s ease-in-out infinite alternate;
        }
        .sub-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%);
          bottom: 8%; right: 3%;
          animation: orbDrift 17s ease-in-out infinite alternate-reverse;
        }
        @keyframes orbDrift { from{transform:translate(0,0)scale(1)} to{transform:translate(35px,25px)scale(1.08)} }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(8,8,6,0.88); backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: opacity 0.4s;
        }
        .modal-overlay.show { opacity: 1; pointer-events: all; }
        .modal {
          border: 1px solid rgba(201,169,110,0.3);
          background: var(--bg, #0d0d0a);
          padding: 4.5rem; max-width: 480px; width: 90%;
          text-align: center; position: relative;
          transform: translateY(24px);
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
        }
        .modal-overlay.show .modal { transform: translateY(0); }
        .modal::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .modal-icon { font-size: 3.5rem; margin-bottom: 1.5rem; display: block; }
        .modal h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300;
          margin: 0 0 0.8rem; line-height: 1.1;
        }
        .modal h3 em { font-style: italic; color: var(--gold); }
        .modal p {
          font-size: 0.92rem; color: var(--text-dim);
          line-height: 1.8; margin-bottom: 2.5rem; font-weight: 300;
        }
        .modal-close {
          background: none; border: 1px solid rgba(245,240,232,0.12);
          color: var(--cream); padding: 1rem 2.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer;
          transition: border-color 0.3s, background 0.3s;
        }
        .modal-close:hover { border-color: var(--gold); background: rgba(201,169,110,0.06); }

        /* HERO */
        .sub-hero {
          max-width: 1300px; margin: 0 auto;
          padding: 7rem 4rem 6rem;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 6rem; align-items: end;
          animation: fadeUp 1.1s cubic-bezier(0.23,1,0.32,1) forwards;
          position: relative; z-index: 1;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 1rem;
          font-size: 0.72rem; letter-spacing: 0.28em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 2rem; opacity: 0.8;
        }
        .eyebrow-line { display: block; width: 30px; height: 1px; background: var(--gold); opacity: 0.7; }

        .sub-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 6vw, 6.5rem);
          font-weight: 300; line-height: 1.05; margin: 0;
        }
        .sub-hero h1 em { font-style: italic; color: var(--gold); }

        .hero-right {
          border-left: 1px solid var(--border);
          padding-left: 4rem;
          display: flex; flex-direction: column; gap: 3rem;
        }
        .hero-right p {
          font-size: 1rem; line-height: 1.9; color: var(--text-dim);
          margin: 0; font-weight: 300;
        }

        /* Billing Toggle */
        .billing-wrap { display: flex; flex-direction: column; gap: 0.8rem; }
        .billing-label {
          font-size: 0.68rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--text-dimmer);
        }
        .billing-toggle {
          display: inline-flex; align-items: stretch;
          border: 1px solid var(--border); overflow: hidden;
          width: fit-content;
        }
        .toggle-opt {
          padding: 0.85rem 1.8rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--text-dimmer);
          background: none; border: none; cursor: pointer;
          transition: background 0.3s, color 0.3s;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .toggle-opt.active { background: var(--gold); color: var(--ink); }
        .toggle-divider { width: 1px; background: var(--border); }
        .save-badge {
          font-size: 0.58rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--sage);
          border: 1px solid rgba(122,140,110,0.3);
          padding: 0.18rem 0.5rem; border-radius: 100px;
        }
        .toggle-opt.active .save-badge { color: var(--ink); border-color: rgba(13,13,10,0.3); }

        /* Section divider */
        .section-divider {
          max-width: 1300px; margin: 0 auto;
          padding: 0 4rem;
          display: flex; align-items: center; gap: 2rem;
          margin-bottom: 4rem; position: relative; z-index: 1;
        }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-label {
          font-size: 0.7rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--text-dimmer); white-space: nowrap;
        }

        /* PRICING GRID */
        .pricing-section {
          max-width: 1300px; margin: 0 auto;
          padding: 0 4rem 9rem;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem; align-items: start;
          position: relative; z-index: 1;
        }

        .pricing-card {
          border: 1px solid var(--border);
          background: rgba(245,240,232,0.01);
          padding: 3rem 2.5rem;
          position: relative; overflow: hidden;
          transition: border-color 0.4s, transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s, background 0.4s;
          cursor: pointer;
        }
        .pricing-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          transform: scaleX(0); transform-origin: center; transition: transform 0.5s;
        }
        .pricing-card:hover {
          border-color: rgba(201,169,110,0.35);
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          background: rgba(201,169,110,0.02);
        }
        .pricing-card:hover::before { transform: scaleX(1); }
        .pricing-card.featured {
          border-color: rgba(201,169,110,0.45);
          background: rgba(201,169,110,0.04);
          transform: translateY(-12px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,169,110,0.2);
        }
        .pricing-card.featured::before { transform: scaleX(1); }
        .pricing-card.featured:hover { transform: translateY(-18px); }

        .plan-badge-top {
          display: inline-block; margin-bottom: 1.8rem;
          font-size: 0.64rem; letter-spacing: 0.18em;
          text-transform: uppercase; padding: 0.3rem 0.8rem;
          border-radius: 100px;
        }
        .badge-popular { color: var(--gold); border: 1px solid rgba(201,169,110,0.4); }
        .badge-new { color: var(--sage); border: 1px solid rgba(122,140,110,0.4); }

        .plan-icon { font-size: 2.2rem; display: block; margin-bottom: 1.2rem; }
        .pricing-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 400;
          margin: 0 0 0.4rem; line-height: 1.2;
        }
        .plan-tagline {
          font-size: 0.82rem; color: var(--text-dimmer);
          margin-bottom: 2.2rem; display: block;
          line-height: 1.6; font-weight: 300;
        }

        .price-display { margin-bottom: 2.5rem; }
        .price-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 3.5vw, 4rem);
          font-weight: 300; color: var(--gold);
          line-height: 1;
        }
        .price-amount sup { font-size: 1.1rem; vertical-align: super; }
        .price-cycle {
          font-size: 0.8rem; color: var(--text-dimmer);
          margin-left: 0.3rem; font-family: 'DM Sans', sans-serif;
        }
        .price-annual {
          font-size: 0.76rem; color: var(--text-dimmer);
          display: block; margin-top: 0.3rem; min-height: 1.2em;
          font-weight: 300;
        }

        .plan-divider { height: 1px; background: var(--border); margin-bottom: 1.8rem; }

        .plan-items { list-style: none; padding: 0; margin: 0 0 2.5rem; display: flex; flex-direction: column; gap: 0.9rem; }
        .plan-item {
          display: flex; align-items: center; gap: 0.9rem;
          font-size: 0.88rem; color: var(--text-dim);
        }
        .plan-item.hl { color: var(--cream); }
        .item-check {
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
          border: 1px solid rgba(122,140,110,0.3);
          background: rgba(122,140,110,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.55rem; color: var(--sage);
        }
        .plan-item.hl .item-check {
          background: rgba(201,169,110,0.1);
          border-color: rgba(201,169,110,0.35); color: var(--gold);
        }

        /* DYNAMIC THEME FIX FOR BUTTONS */
        .btn-subscribe {
          width: 100%; background: none;
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem; letter-spacing: 0.16em;
          text-transform: uppercase; padding: 1.1rem;
          cursor: pointer;
          transition: background 0.3s, border-color 0.3s, color 0.3s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .btn-subscribe::before {
          content: ''; position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(201,169,110,0.12), transparent);
          transition: left 0.4s;
        }
        .btn-subscribe:hover:not(:disabled)::before { left: 100%; }
        .btn-subscribe:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
        .btn-subscribe.primary { background: var(--gold); border-color: var(--gold); color: var(--ink); }
        .btn-subscribe.primary:hover:not(:disabled) { background: var(--gold-hover); transform: translateY(-1px); box-shadow: 0 8px 30px rgba(201,169,110,0.3); }
        .btn-subscribe.success { background: rgba(122,140,110,0.1); border-color: rgba(122,140,110,0.35); color: var(--sage); cursor: default; }
        .btn-subscribe:disabled { opacity: 0.45; cursor: not-allowed; }

        /* COMPARE */
        .compare-section {
          max-width: 1300px; margin: 0 auto;
          padding: 0 4rem 9rem;
          position: relative; z-index: 1;
        }
        .compare-head {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 4rem;
          padding-bottom: 3rem; border-bottom: 1px solid var(--border);
        }
        .section-label {
          font-size: 0.72rem; letter-spacing: 0.25em;
          text-transform: uppercase; color: var(--sage);
          display: block; margin-bottom: 0.8rem;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 3vw, 3.2rem); font-weight: 300; margin: 0;
        }
        .section-title em { font-style: italic; color: var(--gold); }

        .compare-table {
          width: 100%; border-collapse: collapse;
          border: 1px solid var(--border);
        }
        .compare-table th, .compare-table td {
          padding: 1.3rem 2rem; text-align: left;
          border-bottom: 1px solid rgba(245,240,232,0.05);
          font-size: 0.88rem; transition: background 0.3s;
        }
        .compare-table th {
          font-size: 0.7rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--text-dimmer);
          font-weight: 400; background: rgba(245,240,232,0.02);
        }
        .compare-table th.feat-col, .compare-table td.feat-col {
          background: rgba(201,169,110,0.04);
          border-left: 1px solid rgba(201,169,110,0.15);
          border-right: 1px solid rgba(201,169,110,0.15);
        }
        .compare-table tr:last-child td { border-bottom: none; }
        .compare-table tr:hover td { background: rgba(245,240,232,0.01); }
        .compare-table tr:hover td.feat-col { background: rgba(201,169,110,0.05); }
        .feat-name { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-weight: 400; }
        .check-y { color: rgba(122,140,110,0.8); }
        .check-n { color: rgba(245,240,232,0.12); }

        .reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-1 { transition-delay: 0.1s; }
        .reveal-2 { transition-delay: 0.2s; }
        .reveal-3 { transition-delay: 0.3s; }
        .reveal-4 { transition-delay: 0.4s; }

        @media (max-width: 1200px) {
          .pricing-section { grid-template-columns: 1fr 1fr; }
          .pricing-card.featured { transform: none; }
        }
        @media (max-width: 900px) {
          .sub-hero { grid-template-columns: 1fr; gap: 3rem; padding-top: 10rem; }
          .hero-right { border-left: none; border-top: 1px solid var(--border); padding-left: 0; padding-top: 3rem; }
          .compare-section { overflow-x: auto; }
        }
        @media (max-width: 700px) {
          .sub-hero, .pricing-section, .compare-section { padding-left: 2rem; padding-right: 2rem; }
          .pricing-section { grid-template-columns: 1fr; }
          .section-divider { padding-left: 2rem; padding-right: 2rem; }
        }
      `}</style>

      <div className="sub-page">
        <div className="sub-orb sub-orb-1"></div>
        <div className="sub-orb sub-orb-2"></div>

        {/* MODAL */}
        <div className={`modal-overlay ${modalData.isOpen ? 'show' : ''}`}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <span className="modal-icon">{modalData.icon}</span>
            <h3>Welcome to <em>{modalData.planName}</em></h3>
            <p>Your subscription is confirmed. Your first delivery will arrive within 3–5 business days. A confirmation email is on its way.</p>
            <button className="modal-close" onClick={closeModal}>Continue Exploring</button>
          </div>
        </div>

        {/* HERO */}
        <div className="sub-hero">
          <div>
            <div className="hero-eyebrow">
              <span className="eyebrow-line"></span>
              Hydration Plans
              <span className="eyebrow-line"></span>
            </div>
            <h1>Curated<br /><em>Monthly</em><br />Wellness</h1>
          </div>
          <div className="hero-right">
            <p>Save more, stay healthier. Get your curated beverages delivered automatically — cancel or modify anytime, no questions asked. Every plan is crafted for a different wellness archetype.</p>
            <div className="billing-wrap">
              <span className="billing-label">Billing Cycle</span>
              <div className="billing-toggle">
                <button className={`toggle-opt ${billing === 'monthly' ? 'active' : ''}`} onClick={() => setBilling('monthly')}>
                  Monthly
                </button>
                <div className="toggle-divider"></div>
                <button className={`toggle-opt ${billing === 'annual' ? 'active' : ''}`} onClick={() => setBilling('annual')}>
                  Annual <span className="save-badge">Save 20%</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-label">Choose your plan</div>
          <div className="divider-line"></div>
        </div>

        {/* PRICING */}
        <div className="pricing-section">
          {plans.map((plan, i) => (
            <div
              key={plan.key}
              className={`pricing-card reveal reveal-${i + 1} ${plan.featured ? 'featured' : ''}`}
            >
              {plan.badge && (
                <span className={`plan-badge-top ${plan.badge === 'Most Popular' ? 'badge-popular' : 'badge-new'}`}>
                  {plan.badge}
                </span>
              )}
              {!plan.badge && <div style={{ height: '2.6rem' }}></div>}

              <span className="plan-icon">{plan.icon}</span>
              <h3>{plan.name}</h3>
              <span className="plan-tagline">{plan.tagline}</span>

              <div className="price-display">
                <div>
                  <span className="price-amount">
                    <sup>₹</sup>
                    {(billing === 'annual' ? prices[plan.key].annual : prices[plan.key].monthly).toLocaleString('en-IN')}
                    <span className="price-cycle">/{billing === 'annual' ? 'mo' : 'month'}</span>
                  </span>
                </div>
                <span className="price-annual">
                  {billing === 'annual'
                    ? `₹${(prices[plan.key].annual * 12).toLocaleString('en-IN')} billed annually`
                    : '\u00A0'}
                </span>
              </div>

              <div className="plan-divider"></div>

              <ul className="plan-items">
                {plan.items.map((item, idx) => (
                  <li key={idx} className={`plan-item ${plan.highlight[idx] ? 'hl' : ''}`}>
                    <span className="item-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                className={`btn-subscribe ${plan.featured && !subscribedPlans[plan.key] ? 'primary' : ''} ${subscribedPlans[plan.key] ? 'success' : ''}`}
                onClick={() => handleSubscribe(plan.name, plan.icon, plan.key)}
                disabled={subscribedPlans[plan.key] || isProcessing}
              >
                {processingKey === plan.key && isProcessing
                  ? 'Processing…'
                  : subscribedPlans[plan.key]
                    ? '✓ Subscribed'
                    : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* COMPARE TABLE */}
        <section className="compare-section">
          <div className="compare-head reveal">
            <div>
              <span className="section-label">Full Breakdown</span>
              <h2 className="section-title">Compare <em>Plans</em></h2>
            </div>
          </div>
          <table className="compare-table reveal">
            <thead>
              <tr>
                <th style={{width:'28%'}}>Feature</th>
                <th>Detox Starter</th>
                <th className="feat-col">Tea & Coffee</th>
                <th>Fitness Pro</th>
                <th>Total Wellness</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Monthly Price', '₹999', '₹799', '₹1,299', '₹1,599'],
                ['Items per Month', '14 items', '18 items', '19 items', '20 items'],
                ['Free Delivery', true, true, true, true],
                ['Pause / Skip Month', true, true, true, true],
                ['Personalised Curation', false, true, true, true],
                ['Nutrition Guide', false, false, true, true],
                ['Wellness Coach Access', false, false, false, true],
                ['Priority Support', false, true, true, true],
                ['Savings', '10%', '12%', '15%', '20%'],
              ].map(([feature, ...vals], ri) => (
                <tr key={ri}>
                  <td className="feat-name">{feature}</td>
                  {vals.map((v, vi) => (
                    <td key={vi} className={vi === 1 ? 'feat-col' : ''}>
                      {typeof v === 'boolean'
                        ? <span className={v ? 'check-y' : 'check-n'}>{v ? '✓' : '—'}</span>
                        : vi === 1 && ri === 8
                          ? <span style={{color:'var(--gold)'}}>{v}</span>
                          : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}