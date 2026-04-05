import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', address: '', city: '', pin: '' });
  const [orderHistory, setOrderHistory] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!currentUser) { navigate('/login?redirect=/profile'); return; }

    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (docSnap.exists()) setProfileData(prev => ({ ...prev, ...docSnap.data() }));
      } catch (error) { console.error("Error fetching profile:", error); }
    };

    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrderHistory(orders);
      } catch (error) { console.error("Error fetching orders:", error); }
      finally { setLoadingOrders(false); }
    };

    fetchProfile();
    fetchOrders();
  }, [currentUser, navigate]);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [activeTab, loadingOrders]);

  if (!currentUser) return null;

  const email = currentUser.email || '';
  const fullName = (profileData.firstName + ' ' + profileData.lastName).trim() || email.split('@')[0];
  const initial = fullName[0]?.toUpperCase() || '?';
  const displayAddress = [profileData.address, profileData.city, profileData.pin].filter(Boolean).join(', ') || 'Not set';
  const joinDate = currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : new Date();
  const totalSpent = orderHistory.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
      showToast('Profile saved successfully');
    } catch { showToast('Failed to save profile'); }
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch { showToast('Failed to log out'); }
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tabs = [
    { key: 'overview', icon: '◈', label: 'Overview' },
    { key: 'edit', icon: '✦', label: 'Edit Profile' },
    { key: 'subscription', icon: '◇', label: 'Subscription' },
    { key: 'security', icon: '⊕', label: 'Security' },
  ];

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════
           PROFILE PAGE — PREMIUM EDITORIAL
        ═══════════════════════════════════════════════ */

        .profile-page { position: relative; min-height: 100vh; }

        /* Ambient orbs */
        .p-orb {
          position: fixed; border-radius: 50%;
          pointer-events: none; z-index: 0;
        }
        .p-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(122,140,110,0.12) 0%, transparent 70%);
          top: -15%; left: -12%;
          animation: orbDrift 16s ease-in-out infinite alternate;
        }
        .p-orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%);
          bottom: 10%; right: -5%;
          animation: orbDrift 20s ease-in-out infinite alternate-reverse;
        }
        @keyframes orbDrift { from{transform:translate(0,0)} to{transform:translate(30px,20px)} }

        /* HERO */
        .profile-hero {
          max-width: 1300px; margin: 0 auto;
          padding: 5rem 4rem 4rem;
          position: relative; z-index: 1;
          animation: fadeUp 1s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .profile-hero-inner {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 3rem; align-items: end;
          padding-bottom: 3.5rem;
          border-bottom: 1px solid var(--border);
        }

        /* Avatar */
        .avatar-wrap { position: relative; }
        .avatar {
          width: 96px; height: 96px; border-radius: 50%;
          background: rgba(201,169,110,0.06);
          border: 1px solid rgba(201,169,110,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem; font-weight: 300; color: var(--gold);
          position: relative; overflow: hidden;
          transition: border-color 0.4s;
        }
        .avatar:hover { border-color: rgba(201,169,110,0.5); }
        .avatar-ring {
          position: absolute; inset: -5px; border-radius: 50%;
          border: 1px solid rgba(201,169,110,0.15);
          animation: spinRing 24s linear infinite; pointer-events: none;
        }
        .avatar-ring::before {
          content: ''; position: absolute;
          top: 50%; left: -3px; transform: translateY(-50%);
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold); opacity: 0.6;
        }
        @keyframes spinRing { to{transform:rotate(360deg)} }

        .hero-text { padding-bottom: 0.2rem; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem;
          font-size: 0.7rem; letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--sage); margin-bottom: 0.8rem;
        }
        .hero-eyebrow-line { display: block; width: 22px; height: 1px; background: var(--sage); }
        .profile-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 4vw, 4rem);
          font-weight: 300; line-height: 1.05; margin: 0;
        }
        .profile-hero h1 em { font-style: italic; color: var(--gold); }
        .hero-meta {
          font-size: 0.85rem; color: var(--text-dimmer);
          margin-top: 0.5rem; letter-spacing: 0.03em;
        }

        .hero-actions {
          display: flex; flex-direction: column;
          gap: 0.8rem; align-items: flex-end;
          padding-bottom: 0.2rem;
        }
        .btn-logout {
          background: none;
          border: 1px solid rgba(201,112,112,0.25);
          color: rgba(201,112,112,0.7);
          padding: 0.65rem 1.6rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.3s, border-color 0.3s, color 0.3s;
        }
        .btn-logout:hover {
          background: rgba(201,112,112,0.08);
          border-color: rgba(201,112,112,0.5);
          color: #c97070;
        }
        .member-since {
          font-size: 0.7rem; letter-spacing: 0.12em;
          color: var(--text-dimmer); text-align: right;
        }

        /* STATS ROW */
        .stats-row {
          max-width: 1300px; margin: 0 auto;
          padding: 0 4rem; position: relative; z-index: 1;
          animation: fadeUp 1s 0.1s cubic-bezier(0.23,1,0.32,1) both;
        }
        .stats-row-inner {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 3.5rem;
        }
        .stat-card {
          background: rgba(201,169,110,0.02);
          padding: 2.2rem 2.5rem;
          position: relative; overflow: hidden;
          transition: background 0.3s;
        }
        .stat-card::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          transform: scaleX(0); transform-origin: center; transition: transform 0.4s;
        }
        .stat-card:hover { background: var(--card-hover); }
        .stat-card:hover::after { transform: scaleX(1); }
        .stat-label {
          font-size: 0.68rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--text-dimmer);
          display: block; margin-bottom: 0.7rem;
        }
        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.6rem; font-weight: 300;
          color: var(--gold); display: block; line-height: 1;
        }
        .stat-sub { font-size: 0.78rem; color: var(--text-dimmer); margin-top: 0.4rem; }

        /* CONTENT GRID */
        .profile-content {
          max-width: 1300px; margin: 0 auto;
          padding: 0 4rem 8rem;
          display: grid; grid-template-columns: 240px 1fr;
          gap: 3rem; align-items: start;
          position: relative; z-index: 1;
          animation: fadeUp 1s 0.15s cubic-bezier(0.23,1,0.32,1) both;
        }

        /* SIDEBAR */
        .sidebar {
          border: 1px solid var(--border);
          background: rgba(245,240,232,0.01);
          position: sticky; top: 7rem; overflow: hidden;
        }
        .sidebar-head {
          padding: 1.5rem 2rem 1.2rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.65rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--text-dimmer);
        }
        .sidebar-nav { display: flex; flex-direction: column; }
        .sidebar-btn {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.1rem 2rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-dimmer);
          background: none; border: none;
          border-bottom: 1px solid var(--border);
          cursor: pointer; text-align: left; width: 100%;
          transition: background 0.3s, color 0.3s, padding-left 0.3s;
          position: relative;
        }
        .sidebar-btn:last-child { border-bottom: none; }
        .sidebar-btn::before {
          content: ''; position: absolute;
          left: 0; top: 0; bottom: 0; width: 2px;
          background: var(--gold);
          transform: scaleY(0); transform-origin: top; transition: transform 0.3s;
        }
        .sidebar-btn:hover { background: rgba(245,240,232,0.02); color: var(--cream); padding-left: 2.4rem; }
        .sidebar-btn:hover::before { transform: scaleY(1); }
        .sidebar-btn.active { color: var(--gold); background: rgba(201,169,110,0.05); padding-left: 2.4rem; }
        .sidebar-btn.active::before { transform: scaleY(1); }
        .sidebar-icon { font-size: 0.85rem; opacity: 0.7; width: 16px; }

        /* PANEL */
        .profile-panel { animation: fadeUp 1s 0.2s cubic-bezier(0.23,1,0.32,1) both; }
        .panel-head { margin-bottom: 3rem; }
        .panel-label {
          font-size: 0.7rem; letter-spacing: 0.25em;
          text-transform: uppercase; color: var(--sage);
          display: block; margin-bottom: 0.6rem;
        }
        .panel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3vw, 2.8rem); font-weight: 300; margin: 0;
        }
        .panel-title em { font-style: italic; color: var(--gold); }

        /* Overview Grid */
        .overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 3rem; }
        .overview-card {
          border: 1px solid var(--border);
          background: rgba(245,240,232,0.01);
          padding: 2.2rem 2.5rem;
          position: relative; overflow: hidden;
          transition: background 0.3s, border-color 0.3s;
        }
        .overview-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          transform: scaleX(0); transform-origin: center; transition: transform 0.5s;
        }
        .overview-card:hover { background: var(--card-hover); border-color: rgba(201,169,110,0.2); }
        .overview-card:hover::before { transform: scaleX(1); }
        .ov-label {
          font-size: 0.67rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--text-dimmer);
          display: block; margin-bottom: 1rem;
        }
        .ov-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 400; line-height: 1.3;
        }
        .ov-sub { font-size: 0.82rem; color: var(--text-dimmer); margin-top: 0.4rem; }

        /* Orders */
        .orders-list { border: 1px solid var(--border); }
        .order-row {
          display: grid; grid-template-columns: 1fr auto auto;
          gap: 2rem; align-items: center;
          padding: 1.6rem 2rem;
          border-bottom: 1px solid var(--border);
          background: rgba(245,240,232,0.01);
          transition: background 0.3s; position: relative;
        }
        .order-row:last-child { border-bottom: none; }
        .order-row:hover { background: var(--card-hover); }
        .order-row::before {
          content: ''; position: absolute;
          left: 0; top: 0; bottom: 0; width: 2px;
          background: var(--gold);
          transform: scaleY(0); transform-origin: top; transition: transform 0.3s;
        }
        .order-row:hover::before { transform: scaleY(1); }
        .order-id {
          font-size: 0.68rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--text-dimmer); margin-bottom: 0.3rem;
        }
        .order-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 400;
        }
        .order-date { font-size: 0.82rem; color: var(--text-dim); white-space: nowrap; }
        .order-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; color: var(--gold);
        }
        .order-status {
          font-size: 0.62rem; letter-spacing: 0.14em;
          text-transform: uppercase; padding: 0.25rem 0.75rem;
          border-radius: 100px; text-align: center; white-space: nowrap;
        }
        .status-success { color: var(--sage); border: 1px solid rgba(122,140,110,0.3); background: rgba(122,140,110,0.07); }

        .no-orders {
          padding: 3rem; text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-style: italic; color: var(--text-dimmer);
        }

        /* Edit form */
        .edit-form { border: 1px solid var(--border); }
        .form-row {
          display: grid; grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border);
        }
        .form-row:last-of-type { border-bottom: none; }
        .form-field {
          padding: 2rem 2.5rem;
          border-right: 1px solid var(--border);
          position: relative; transition: background 0.3s;
        }
        .form-field:last-child { border-right: none; }
        .form-field.full { grid-column: 1/-1; border-right: none; }
        .form-field:focus-within { background: rgba(201,169,110,0.02); }
        .form-label {
          font-size: 0.68rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--text-dimmer);
          display: block; margin-bottom: 0.7rem; transition: color 0.3s;
        }
        .form-field:focus-within .form-label { color: var(--gold); }
        .form-input {
          width: 100%; background: rgba(245,240,232,0.02);
          border: 1px solid rgba(245,240,232,0.08); outline: none;
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 0.97rem; font-weight: 300;
          padding: 0.85rem 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }
        .form-input::placeholder { color: var(--text-dimmer); opacity: 0.5; }
        .form-input:focus {
          border-color: rgba(201,169,110,0.45);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.05);
        }
        .form-actions {
          padding: 2rem 2.5rem; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 2rem;
        }
        .btn-save {
          background: var(--gold); color: var(--ink); border: none;
          padding: 1rem 2.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.16em;
          text-transform: uppercase; font-weight: 500; cursor: pointer;
          transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .btn-save:hover { background: var(--gold-hover); transform: translateY(-1px); box-shadow: 0 8px 30px rgba(201,169,110,0.25); }

        /* Subscription */
        .sub-empty {
          border: 1px solid rgba(201,169,110,0.2);
          background: rgba(201,169,110,0.02);
          padding: 5rem 3rem; text-align: center;
          position: relative; overflow: hidden;
        }
        .sub-empty::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .sub-empty-icon { font-size: 3.5rem; display: block; margin-bottom: 1.5rem; opacity: 0.4; }
        .sub-empty-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300; color: var(--text-dim); margin-bottom: 0.8rem;
        }
        .sub-empty-desc {
          font-size: 0.9rem; color: var(--text-dimmer); margin-bottom: 2.5rem; line-height: 1.8;
        }

        /* Security */
        .security-list { border: 1px solid var(--border); }
        .security-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 2rem 2.5rem; border-bottom: 1px solid var(--border);
          transition: background 0.3s;
        }
        .security-row:last-child { border-bottom: none; }
        .security-row:hover { background: var(--card-hover); }
        .security-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 400; margin-bottom: 0.3rem;
        }
        .security-desc { font-size: 0.82rem; color: var(--text-dim); }
        .btn-secondary {
          padding: 0.65rem 1.4rem;
          border: 1px solid rgba(245,240,232,0.1);
          background: none; color: var(--text-dimmer);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
          transition: border-color 0.3s, color 0.3s;
          white-space: nowrap;
        }
        .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

        .tag-disabled {
          font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 0.25rem 0.75rem; border-radius: 100px;
          color: var(--text-dimmer); border: 1px solid rgba(245,240,232,0.08);
        }

        .danger-zone {
          margin-top: 2.5rem;
          border: 1px solid rgba(201,112,112,0.2);
          padding: 2.5rem;
        }
        .danger-label {
          font-size: 0.68rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(201,112,112,0.6);
          display: block; margin-bottom: 1rem;
        }
        .danger-desc {
          font-size: 0.88rem; color: var(--text-dim);
          margin: 0 0 1.8rem; line-height: 1.75;
        }
        .btn-delete {
          padding: 0.8rem 1.8rem;
          border: 1px solid rgba(201,112,112,0.25);
          background: none; color: rgba(201,112,112,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.74rem; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.3s, border-color 0.3s, color 0.3s;
        }
        .btn-delete:hover {
          background: rgba(201,112,112,0.08);
          border-color: rgba(201,112,112,0.5);
          color: #c97070;
        }

        /* Toast */
        .profile-toast {
          position: fixed; bottom: 2.5rem; left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: rgba(13,13,10,0.94);
          border: 1px solid rgba(245,240,232,0.08);
          border-left: 2px solid var(--gold);
          backdrop-filter: blur(20px);
          padding: 1rem 2rem;
          font-size: 0.84rem; color: var(--cream);
          z-index: 200; opacity: 0;
          transition: opacity 0.4s, transform 0.4s;
          pointer-events: none; white-space: nowrap;
          letter-spacing: 0.04em;
        }
        .profile-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 1000px) {
          .profile-hero-inner { grid-template-columns: auto 1fr; }
          .hero-actions { grid-column: 1/-1; flex-direction: row; align-items: center; justify-content: space-between; }
          .stats-row-inner { grid-template-columns: 1fr 1fr; }
          .profile-content { grid-template-columns: 1fr; }
          .sidebar { position: static; }
          .sidebar-nav { flex-direction: row; flex-wrap: wrap; }
          .sidebar-btn { border-right: 1px solid var(--border); border-bottom: none; flex: 1; justify-content: center; }
          .overview-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .form-field { border-right: none; border-bottom: 1px solid var(--border); }
        }
        @media (max-width: 700px) {
          .profile-hero, .stats-row, .profile-content { padding-left: 2rem; padding-right: 2rem; }
        }
      `}</style>

      <div className="profile-page">
        <div className="p-orb p-orb-1"></div>
        <div className="p-orb p-orb-2"></div>
        <div className={`profile-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        {/* HERO */}
        <div className="profile-hero">
          <div className="profile-hero-inner">
            <div className="avatar-wrap">
              <div className="avatar">{initial}</div>
              <div className="avatar-ring"></div>
            </div>
            <div className="hero-text">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-line"></span>
                Member Account
              </div>
              <h1>Welcome back,<br /><em>{profileData.firstName || fullName.split(' ')[0]}</em></h1>
              <p className="hero-meta">{email}</p>
            </div>
            <div className="hero-actions">
              <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
              <span className="member-since">Member since {joinDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stats-row-inner">
            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{loadingOrders ? '—' : orderHistory.length}</span>
              <div className="stat-sub">Since joining</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Subscription</span>
              <span className="stat-value">None</span>
              <div className="stat-sub">No active plan</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">₹{loadingOrders ? '—' : totalSpent.toLocaleString('en-IN')}</span>
              <div className="stat-sub">Lifetime value</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Loyalty Points</span>
              <span className="stat-value">{loadingOrders ? '—' : Math.floor(totalSpent * 0.1)}</span>
              <div className="stat-sub">10% back on purchases</div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="profile-content">
          <div className="sidebar">
            <div className="sidebar-head">Navigation</div>
            <div className="sidebar-nav">
              {tabs.map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`sidebar-btn ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  <span className="sidebar-icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-panel">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div className="panel-head">
                  <span className="panel-label">Dashboard</span>
                  <h2 className="panel-title">Your <em>Overview</em></h2>
                </div>
                <div className="overview-grid reveal">
                  <div className="overview-card">
                    <span className="ov-label">Active Subscription</span>
                    <div className="ov-value">Not Subscribed</div>
                    <div className="ov-sub" style={{opacity:0.5}}>No recurring deliveries</div>
                  </div>
                  <div className="overview-card">
                    <span className="ov-label">Next Delivery</span>
                    <div className="ov-value">—</div>
                    <div className="ov-sub" style={{opacity:0.5}}>No pending orders</div>
                  </div>
                  <div className="overview-card">
                    <span className="ov-label">Delivery Address</span>
                    <div className="ov-value" style={{fontSize:'1.1rem'}}>{displayAddress}</div>
                    <div className="ov-sub">Default address</div>
                  </div>
                  <div className="overview-card">
                    <span className="ov-label">Loyalty Status</span>
                    <div className="ov-value">Member</div>
                    <div className="ov-sub">Earn points with every purchase</div>
                  </div>
                </div>

                <div className="panel-label" style={{marginBottom:'1.2rem'}}>Recent Orders</div>
                <div className="orders-list reveal">
                  {loadingOrders ? (
                    <div className="no-orders">Fetching orders…</div>
                  ) : orderHistory.length === 0 ? (
                    <div className="no-orders">You haven't placed any orders yet.</div>
                  ) : (
                    orderHistory.slice(0, 5).map(order => (
                      <div className="order-row" key={order.id}>
                        <div>
                          <div className="order-id">#ORD-{order.id.slice(-4).toUpperCase()}</div>
                          <div className="order-name">
                            {order.items?.length === 1
                              ? `${order.items[0].name} × ${order.items[0].qty}`
                              : `${order.items?.length || 0} Items`}
                          </div>
                        </div>
                        <div className="order-date">{formatDate(order.createdAt)}</div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.5rem'}}>
                          <span className="order-amount">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                          <span className={`order-status status-${(order.paymentStatus || 'success').toLowerCase()}`}>
                            {order.paymentStatus || 'Success'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* EDIT PROFILE */}
            {activeTab === 'edit' && (
              <div>
                <div className="panel-head">
                  <span className="panel-label">Account Settings</span>
                  <h2 className="panel-title">Edit <em>Profile</em></h2>
                </div>
                <div className="edit-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">First Name</label>
                      <input className="form-input" type="text" name="firstName" placeholder="Your first name" value={profileData.firstName} onChange={handleInputChange} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" type="text" name="lastName" placeholder="Your last name" value={profileData.lastName} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" type="email" value={email} disabled style={{opacity:0.45}} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" type="tel" name="phone" placeholder="+91 98765 43210" value={profileData.phone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field full">
                      <label className="form-label">Delivery Address</label>
                      <input className="form-input" type="text" name="address" placeholder="Flat / Building, Street, Area" value={profileData.address} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">City</label>
                      <input className="form-input" type="text" name="city" placeholder="Mumbai" value={profileData.city} onChange={handleInputChange} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">PIN Code</label>
                      <input className="form-input" type="text" name="pin" placeholder="400001" value={profileData.pin} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <div>
                <div className="panel-head">
                  <span className="panel-label">Recurring Plan</span>
                  <h2 className="panel-title">My <em>Subscription</em></h2>
                </div>
                <div className="sub-empty">
                  <span className="sub-empty-icon">📦</span>
                  <div className="sub-empty-name">No Active Plan</div>
                  <p className="sub-empty-desc">You are not subscribed to any recurring delivery plan.</p>
                  <button className="btn-save" onClick={() => navigate('/subscription')}>Explore Plans</button>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <div>
                <div className="panel-head">
                  <span className="panel-label">Privacy & Safety</span>
                  <h2 className="panel-title">Security <em>Settings</em></h2>
                </div>
                <div className="security-list reveal">
                  <div className="security-row">
                    <div>
                      <div className="security-title">Password</div>
                      <div className="security-desc">Manage your account password</div>
                    </div>
                    <button className="btn-secondary" onClick={() => showToast('Password reset email sent')}>Reset Password</button>
                  </div>
                  <div className="security-row">
                    <div>
                      <div className="security-title">Two-Factor Authentication</div>
                      <div className="security-desc">Adds an extra layer of account security</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                      <span className="tag-disabled">Disabled</span>
                      <button className="btn-secondary" onClick={() => showToast('2FA setup coming soon')}>Enable</button>
                    </div>
                  </div>
                </div>
                <div className="danger-zone">
                  <span className="danger-label">⚠ Danger Zone</span>
                  <p className="danger-desc">Permanently delete your OneSip account and all associated data including orders, subscriptions, and preferences. This action cannot be undone.</p>
                  <button className="btn-delete" onClick={() => showToast('Please contact support to delete account')}>Delete My Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}