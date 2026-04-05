import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useState } from 'react';

// ── SET YOUR OFFICIAL ADMIN EMAIL HERE ──
const ADMIN_EMAIL = "saniya.ckadam@gmail.com";

export default function Admin() {
  // ── ALL ORIGINAL LOGIC PRESERVED — NO CHANGES ──
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
    payments: { upi: 0, card: 0, cod: 0 },
    success: { rate: 0, count: 0 },
    alerts: [],
    totalCustomers: 0,
    inventoryValuation: 0,
    avgOrderValue: 0,
    activeSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    teaPlanCount: 0,
    fitnessPlanCount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) navigate('/login');
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      let upiCount = 0, cardCount = 0, codCount = 0;
      let totalRev = 0;
      let productCount = {};
      let successCount = 0;
      let customerEmails = new Set();

      orders.forEach(order => {
        totalRev += order.totalAmount || 0;
        if (order.userEmail) customerEmails.add(order.userEmail);
        if (order.items) {
          order.items.forEach(item => {
            productCount[item.name] = (productCount[item.name] || 0) + (item.qty || 1);
          });
        }
        if (order.paymentMethod === 'UPI') upiCount++;
        if (order.paymentMethod === 'Card') cardCount++;
        if (order.paymentMethod === 'COD') codCount++;
        if (order.paymentStatus === 'Success') successCount++;
      });

      const sortedProducts = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(p => ({ name: p[0], qty: p[1] }));
      while (sortedProducts.length < 3) sortedProducts.push({ name: '—', qty: 0 });

      setMetrics(prev => ({
        ...prev,
        totalOrders: orders.length,
        totalRevenue: totalRev,
        totalCustomers: customerEmails.size,
        avgOrderValue: orders.length > 0 ? totalRev / orders.length : 0,
        topProducts: sortedProducts,
        payments: { upi: upiCount, card: cardCount, cod: codCount },
        success: {
          rate: orders.length > 0 ? (successCount / orders.length) * 100 : 0,
          count: successCount
        }
      }));
    });

    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const lowStockAlerts = [];
      let totalValuation = 0;
      snapshot.forEach(doc => {
        const product = doc.data();
        totalValuation += (product.stockQuantity * product.price);
        if (product.stockQuantity <= 10) lowStockAlerts.push({ product: product.name, stock: product.stockQuantity });
      });
      setMetrics(prev => ({ ...prev, alerts: lowStockAlerts, inventoryValuation: totalValuation }));
    });

    const unsubscribeSubscriptions = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
      let activeCount = 0, mrr = 0, teaCount = 0, fitnessCount = 0;
      snapshot.forEach(doc => {
        const sub = doc.data();
        if (sub.status === 'Active') {
          activeCount++;
          mrr += sub.billingCycle === 'annual' ? (sub.price / 12) : sub.price;
          if (sub.planKey === 'tea') teaCount++;
          if (sub.planKey === 'fitness') fitnessCount++;
        }
      });
      setMetrics(prev => ({ ...prev, activeSubscriptions: activeCount, monthlyRecurringRevenue: Math.round(mrr), teaPlanCount: teaCount, fitnessPlanCount: fitnessCount }));
      setLoading(false);
    });

    return () => { unsubscribeOrders(); unsubscribeProducts(); unsubscribeSubscriptions(); };
  }, [currentUser]);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  const renderSuccessMessage = () => {
    const { rate, count } = metrics.success;
    const { totalOrders } = metrics;
    if (totalOrders === 0) return <>No orders yet. Place an order from the cart to see payment analytics.</>;
    if (rate >= 90) return <><strong>{count} of {totalOrders}</strong> orders completed successfully. Excellent checkout health — rate above 90% threshold.</>;
    if (rate >= 70) return <><strong>{count} of {totalOrders}</strong> orders completed. Moderate success rate — consider reviewing payment gateway stability.</>;
    return <><strong>{count} of {totalOrders}</strong> orders completed. Low success rate — investigate payment failures in order logs.</>;
  };

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return null;

  // Derived for visual bars
  const payTotal = metrics.payments.upi + metrics.payments.card + metrics.payments.cod || 1;
  const upiPct   = Math.round((metrics.payments.upi / payTotal) * 100);
  const cardPct  = Math.round((metrics.payments.card / payTotal) * 100);
  const codPct   = Math.round((metrics.payments.cod / payTotal) * 100);

  return (
    <>
      <style>{`
        /* ── HERO ── */
        .admin-hero { padding:4rem 4rem 7rem; text-align:center; border-bottom:1px solid var(--border); position:relative; overflow:hidden; }
        .admin-hero::before { content:''; position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle, var(--orb-sage,rgba(122,140,110,0.18)) 0%, transparent 70%); top:-20%; left:-5%; animation:drift 12s ease-in-out infinite alternate; pointer-events:none; }
        .admin-hero::after  { content:''; position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle, var(--orb-gold,rgba(201,169,110,0.12)) 0%, transparent 70%); bottom:-10%; right:5%; animation:drift 15s ease-in-out infinite alternate-reverse; pointer-events:none; }
        @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,30px) scale(1.1)} }
        .hero-eyebrow { display:inline-flex; align-items:center; gap:0.8rem; font-size:0.8rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--gold); margin-bottom:2rem; }
        .hero-eyebrow span { display:block; width:30px; height:1px; background:var(--gold); }
        .admin-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(3rem,5.5vw,5.5rem); font-weight:300; line-height:1.05; margin-bottom:1.2rem; position:relative; z-index:1; margin-top:0; }
        .admin-hero h1 em { font-style:italic; color:var(--gold); }
        .admin-hero p { color:var(--text-dim); font-size:1.05rem; letter-spacing:0.04em; position:relative; z-index:1; margin-top:0; }

        /* ── DASHBOARD ── */
        .admin-dashboard { max-width:1300px; margin:0 auto; padding:7rem 4rem; }

        /* Summary stat cards */
        .admin-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); margin-bottom:7rem; }
        .stat-card { background:var(--card-bg); padding:4rem 3rem; text-align:center; position:relative; overflow:hidden; transition:background 0.4s; }
        .stat-card::before { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(to right,transparent,var(--gold),transparent); transform:scaleX(0); transform-origin:center; transition:transform 0.5s; }
        .stat-card:hover { background:var(--card-hover); }
        .stat-card:hover::before { transform:scaleX(1); }
        .stat-label { font-size:0.78rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dimmer); display:block; margin-bottom:1.2rem; }
        .stat-num { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,4vw,4rem); font-weight:300; line-height:1; color:var(--gold); }

        /* Sections */
        .admin-section { margin-bottom:5.5rem; }
        .section-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:2.5rem; padding-bottom:1.2rem; border-bottom:1px solid var(--border); }
        .section-label { font-size:0.74rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--sage); display:block; margin-bottom:0.5rem; }
        .section-title { font-family:'Cormorant Garamond',serif; font-size:2.4rem; font-weight:300; margin:0; }
        .section-title em { font-style:italic; color:var(--gold); }

        /* Data boxes */
        .data-box { border:1px solid var(--border); background:var(--glass); padding:2.5rem 3rem; margin-bottom:1px; position:relative; overflow:hidden; transition:background 0.4s,border-color 0.4s; display:flex; align-items:center; justify-content:space-between; gap:2rem; }
        .data-box::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,transparent,var(--gold),transparent); transform:scaleY(0); transform-origin:center; transition:transform 0.4s; }
        .data-box:hover { background:var(--card-hover); border-color:rgba(201,169,110,0.3); }
        .data-box:hover::before { transform:scaleY(1); }
        .data-box-content h4 { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:400; color:var(--cream); margin-bottom:0.4rem; margin-top:0; }
        .data-box-content p { font-size:0.92rem; color:var(--text-dim); margin:0; }
        .data-box-meta { text-align:right; flex-shrink:0; }
        .meta-num { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:300; color:var(--gold); display:block; line-height:1; }
        .meta-label { font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dimmer); }

        /* ── ERP / CRM MODULE CARDS ── */
        .integration-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); border:1px solid var(--border); margin-bottom:5.5rem; }
        .integration-card { background:var(--card-bg); padding:3rem; }
        .int-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; border-bottom:1px solid var(--border); padding-bottom:1rem; }
        .int-type { font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold); }
        .int-title { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:300; margin:0; }
        .int-title em { font-style:italic; }
        .int-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; padding:0.7rem 0; border-bottom:1px solid var(--border); }
        .int-row:last-child { border-bottom:none; }
        .int-label { font-size:0.82rem; color:var(--text-dimmer); }
        .int-val { font-family:'Cormorant Garamond',serif; font-size:1.2rem; color:var(--cream); }

        /* ── PRODUCT RANK with mini bar ── */
        .product-rank { border:1px solid var(--border); background:var(--glass); padding:2rem 3rem; margin-bottom:1px; display:flex; flex-direction:column; gap:1rem; transition:background 0.4s; }
        .product-rank:hover { background:var(--card-hover); }
        .rank-top { display:flex; justify-content:space-between; align-items:center; }
        .rank-name { font-family:'Cormorant Garamond',serif; font-size:1.45rem; font-weight:400; }
        .rank-qty { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:300; color:var(--gold); }
        .rank-bar-track { height:3px; background:var(--border); border-radius:100px; overflow:hidden; }
        .rank-bar-fill { height:100%; border-radius:100px; background:linear-gradient(to right,var(--sage),var(--gold)); transition:width 1.2s cubic-bezier(0.23,1,0.32,1); }
        .rank-meta { font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-dimmer); display:flex; gap:1.5rem; }

        /* ── PAYMENT METHOD DONUT-STYLE BARS ── */
        .payment-section { margin-bottom:5.5rem; }
        .payment-methods-visual { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); border:1px solid var(--border); margin-bottom:1px; }
        .pay-method-card { background:var(--card-bg); padding:3rem; transition:background 0.4s; }
        .pay-method-card:hover { background:var(--card-hover); }
        .pay-method-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
        .pay-method-icon { font-size:2rem; }
        .pay-method-name { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dimmer); }
        .pay-method-num { font-family:'Cormorant Garamond',serif; font-size:3rem; font-weight:300; line-height:1; margin-bottom:0.8rem; }
        .pay-method-num.upi-col  { color:#8bc4a8; }
        .pay-method-num.card-col { color:#a8bce0; }
        .pay-method-num.cod-col  { color:var(--gold); }
        .pay-method-bar-track { height:4px; background:var(--border); border-radius:100px; overflow:hidden; margin-bottom:0.6rem; }
        .pay-method-bar-fill { height:100%; border-radius:100px; transition:width 1.2s cubic-bezier(0.23,1,0.32,1); }
        .pay-upi-fill  { background:linear-gradient(to right,#6ba890,#8bc4a8); }
        .pay-card-fill { background:linear-gradient(to right,#7898c0,#a8bce0); }
        .pay-cod-fill  { background:linear-gradient(to right,#b09050,var(--gold)); }
        .pay-method-pct { font-size:0.75rem; color:var(--text-dimmer); letter-spacing:0.08em; }

        /* ── SUCCESS RATE ── */
        .success-rate-wrap { border:1px solid var(--border); padding:2.8rem 3rem; display:flex; align-items:center; gap:3rem; background:var(--glass); transition:background 0.4s; }
        .success-rate-wrap:hover { background:var(--card-hover); }
        .success-label-block { min-width:200px; }
        .success-big { font-family:'Cormorant Garamond',serif; font-size:clamp(3rem,4vw,4.2rem); font-weight:300; color:var(--success-col,#7a8c6e); line-height:1; display:block; margin-bottom:0.5rem; }
        .success-sub { font-size:0.78rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dimmer); }
        .success-bar-wrap { flex:1; }
        .success-bar-track { height:6px; background:var(--border); border-radius:100px; overflow:hidden; margin-bottom:0.8rem; }
        .success-bar-fill { height:100%; border-radius:100px; background:linear-gradient(to right,var(--sage),var(--gold)); transition:width 1.4s cubic-bezier(0.23,1,0.32,1); width:0%; }
        .success-bar-desc { font-size:0.82rem; color:var(--text-dim); line-height:1.6; margin:0; }

        /* ── ALERTS ── */
        .alert-list { list-style:none; padding:0; margin:0; }
        .alert-list li { display:flex; align-items:center; gap:1.2rem; padding:1.5rem 2rem; border:1px solid var(--alert-border,rgba(255,179,179,0.15)); border-bottom:none; color:var(--alert-color,#ffb3b3); font-size:0.95rem; background:rgba(255,179,179,0.03); transition:background 0.3s; }
        .alert-list li:last-child { border-bottom:1px solid var(--alert-border,rgba(255,179,179,0.15)); }
        .alert-list li:hover { background:rgba(255,179,179,0.05); }
        .alert-icon { font-size:1.1rem; flex-shrink:0; }
        .alert-text { flex:1; }
        .alert-badge { font-size:0.68rem; letter-spacing:0.12em; text-transform:uppercase; border:1px solid var(--alert-color,#ffb3b3); padding:0.2rem 0.6rem; border-radius:100px; opacity:0.7; flex-shrink:0; }

        /* REVEAL */
        .reveal { opacity:0; transform:translateY(30px); transition:opacity 0.9s cubic-bezier(0.23,1,0.32,1),transform 0.9s cubic-bezier(0.23,1,0.32,1); }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-delay-1 { transition-delay:0.1s; }
        .reveal-delay-2 { transition-delay:0.2s; }
        .reveal-delay-3 { transition-delay:0.3s; }

        @media (max-width:900px) {
          .admin-stats, .integration-grid, .payment-methods-visual { grid-template-columns:1fr; }
          .admin-hero, .admin-dashboard { padding-left:2rem; padding-right:2rem; }
          .data-box { flex-direction:column; align-items:flex-start; gap:1rem; }
          .data-box-meta { text-align:left; }
          .success-rate-wrap { flex-direction:column; gap:1.5rem; }
          .success-label-block { min-width:unset; }
        }
      `}</style>

      {/* HERO */}
      <section className="admin-hero">
        <div className="hero-eyebrow"><span></span>Supply Chain Intelligence<span></span></div>
        <h1>Analytics &<br /><em>Dashboard</em></h1>
        <p>E-Business Integration: ERP & CRM Strategy Overview</p>
      </section>

      <section className="admin-dashboard">

        {/* Summary Stats */}
        <div className="admin-stats">
          <div className="stat-card reveal">
            <span className="stat-label">Total Orders</span>
            <span className="stat-num">{metrics.totalOrders}</span>
          </div>
          <div className="stat-card reveal reveal-delay-1">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-num">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="stat-card reveal reveal-delay-2">
            <span className="stat-label">Active Subscriptions</span>
            <span className="stat-num">{metrics.activeSubscriptions}</span>
          </div>
        </div>

        {/* ERP & CRM Modules */}
        <div className="integration-grid reveal">
          <div className="integration-card">
            <div className="int-header">
              <span className="int-type">CRM Module</span>
              <h3 className="int-title">Customer <em>Insights</em></h3>
            </div>
            <div className="int-row"><span className="int-label">Unique Customers</span><span className="int-val">{metrics.totalCustomers}</span></div>
            <div className="int-row"><span className="int-label">Avg. Order Value</span><span className="int-val">₹{Math.floor(metrics.avgOrderValue).toLocaleString('en-IN')}</span></div>
            <div className="int-row"><span className="int-label">Customer Satisfaction</span><span className="int-val" style={{color:'var(--sage)'}}>94%</span></div>
          </div>
          <div className="integration-card" style={{ borderLeft:'1px solid var(--border)' }}>
            <div className="int-header">
              <span className="int-type">ERP Module</span>
              <h3 className="int-title">Resource <em>Planning</em></h3>
            </div>
            <div className="int-row"><span className="int-label">Inventory Valuation</span><span className="int-val">₹{metrics.inventoryValuation.toLocaleString('en-IN')}</span></div>
            <div className="int-row"><span className="int-label">Supply Chain Status</span><span className="int-val" style={{color:'var(--sage)'}}>Optimized</span></div>
            <div className="int-row"><span className="int-label">Asset Utilization</span><span className="int-val">82%</span></div>
          </div>
        </div>

        {/* Top Selling Products — rank bars */}
        <div className="admin-section reveal">
          <div className="section-header">
            <div>
              <span className="section-label">Performance</span>
              <h2 className="section-title">Top Selling <em>Products</em></h2>
            </div>
          </div>
          {metrics.topProducts.map((product, index) => {
            const maxQty = metrics.topProducts[0]?.qty || 1;
            const barWidth = maxQty > 0 ? Math.round((product.qty / maxQty) * 100) : 0;
            return (
              <div key={index} className={`product-rank reveal reveal-delay-${index+1}`}>
                <div className="rank-top">
                  <span className="rank-name">{product.name}</span>
                  <span className="rank-qty">{product.qty}</span>
                </div>
                <div className="rank-bar-track">
                  <div className="rank-bar-fill" style={{ width: `${barWidth}%` }}></div>
                </div>
                <div className="rank-meta">
                  <span>#{index+1} Rank</span>
                  <span>{product.qty} units sold</span>
                  <span>{barWidth}% of top seller</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription Insights */}
        <div className="admin-section reveal">
          <div className="section-header">
            <div>
              <span className="section-label">Recurring Revenue Model</span>
              <h2 className="section-title">Subscription <em>Insights</em></h2>
            </div>
          </div>
          <div className="data-box reveal reveal-delay-1">
            <div className="data-box-content">
              <h4>Monthly Recurring Revenue (MRR)</h4>
              <p>Predictable monthly income generated from all active automated subscriptions.</p>
            </div>
            <div className="data-box-meta">
              <span className="meta-num">₹{metrics.monthlyRecurringRevenue.toLocaleString('en-IN')}</span>
              <span className="meta-label">Current MRR</span>
            </div>
          </div>
          <div className="data-box reveal reveal-delay-2">
            <div className="data-box-content">
              <h4>Tea & Coffee Premium</h4>
              <p>Total active subscribers for our bestselling morning ritual plan.</p>
            </div>
            <div className="data-box-meta">
              <span className="meta-num">{metrics.teaPlanCount}</span>
              <span className="meta-label">Active Users</span>
            </div>
          </div>
          <div className="data-box reveal reveal-delay-3">
            <div className="data-box-content">
              <h4>Fitness Protein Pro</h4>
              <p>Total active subscribers for the high-yield athletic performance plan.</p>
            </div>
            <div className="data-box-meta">
              <span className="meta-num">{metrics.fitnessPlanCount}</span>
              <span className="meta-label">Active Users</span>
            </div>
          </div>
        </div>

        {/* Payment Insights — visual bars per method */}
        <div className="payment-section">
          <div className="section-header reveal">
            <div>
              <span className="section-label">Transaction Analytics</span>
              <h2 className="section-title">Payment <em>Insights</em></h2>
            </div>
          </div>

          <div className="payment-methods-visual reveal">
            {/* UPI */}
            <div className="pay-method-card">
              <div className="pay-method-header">
                <span className="pay-method-icon">📱</span>
                <span className="pay-method-name">UPI Transactions</span>
              </div>
              <div className="pay-method-num upi-col">{metrics.payments.upi}</div>
              <div className="pay-method-bar-track">
                <div className="pay-method-bar-fill pay-upi-fill" style={{ width:`${upiPct}%` }}></div>
              </div>
              <div className="pay-method-pct">{upiPct}% of total · GPay · PhonePe · Paytm</div>
            </div>

            {/* Card */}
            <div className="pay-method-card" style={{ borderLeft:'1px solid var(--border)' }}>
              <div className="pay-method-header">
                <span className="pay-method-icon">💳</span>
                <span className="pay-method-name">Card Payments</span>
              </div>
              <div className="pay-method-num card-col">{metrics.payments.card}</div>
              <div className="pay-method-bar-track">
                <div className="pay-method-bar-fill pay-card-fill" style={{ width:`${cardPct}%` }}></div>
              </div>
              <div className="pay-method-pct">{cardPct}% of total · Visa · Mastercard · RuPay</div>
            </div>
          </div>

          {/* COD as full-width box */}
          <div className="pay-method-card reveal" style={{ border:'1px solid var(--border)', borderTop:'none', borderLeft:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'3rem', padding:'3rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
              <span style={{ fontSize:'2rem' }}>🏠</span>
              <div>
                <span className="pay-method-name" style={{ display:'block', marginBottom:'0.4rem' }}>Cash on Delivery</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-dimmer)' }}>Pay at doorstep</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <span className="pay-method-num cod-col" style={{ display:'block' }}>{metrics.payments.cod}</span>
              <span className="pay-method-pct">{codPct}% of total transactions</span>
            </div>
          </div>

          {/* Success Rate */}
          <div className="success-rate-wrap reveal" style={{ marginTop:'1px' }}>
            <div className="success-label-block">
              <span className="success-big">{metrics.success.rate.toFixed(1)}%</span>
              <span className="success-sub">Payment Success Rate</span>
            </div>
            <div className="success-bar-wrap">
              <div className="success-bar-track">
                <div className="success-bar-fill" style={{ width:`${metrics.success.rate}%` }}></div>
              </div>
              <p className="success-bar-desc">{renderSuccessMessage()}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-section reveal">
          <div className="section-header">
            <div>
              <span className="section-label">Inventory (ERP Control)</span>
              <h2 className="section-title">Low Stock <em>Alerts</em></h2>
            </div>
          </div>
          <ul className="alert-list">
            {metrics.alerts.length > 0 ? (
              metrics.alerts.map((alert, idx) => (
                <li key={idx}>
                  <span className="alert-icon">⚠</span>
                  <span className="alert-text">{alert.product} — Only {alert.stock} unit{alert.stock !== 1 ? 's' : ''} left</span>
                  <span className="alert-badge">{alert.stock <= 5 ? 'Critical' : 'Reorder Now'}</span>
                </li>
              ))
            ) : (
              <li>
                <span className="alert-icon">✓</span>
                <span className="alert-text">All products sufficiently stocked</span>
                <span className="alert-badge" style={{ color:'var(--sage)', borderColor:'var(--sage)' }}>Stable</span>
              </li>
            )}
          </ul>
        </div>

      </section>
    </>
  );
}