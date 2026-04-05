import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase/config';

// Material Icons
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    currentUser, 
    googleLogin, 
    login, 
    sendVerificationMail,
    completeLinkLogin,
    setupAccountPassword,
    validatePasswordStrength
  } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  
  const [view, setView] = useState('auth'); 
  const [isLoginMode, setIsLoginMode] = useState(false); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const clearErrors = () => { setErrorMsg(''); setSuccessMsg(''); };

  // Calculate password strength dynamically as the user types
  const strength = validatePasswordStrength(password || '');
  const getStrengthText = () => {
    if (!password) return '';
    if (strength.score <= 1) return 'Weak';
    if (strength.score === 2) return 'Fair';
    if (strength.score === 3) return 'Good';
    return 'Strong';
  };

  useEffect(() => {
    const handleIncomingLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setLoading(true);
        setView('set-password'); 
        try {
          await completeLinkLogin(window.location.href);
          setSuccessMsg('✓ Email verified! Set a password to complete your account.');
        } catch (error) {
          setErrorMsg('Verification link expired. Please try signing up again.');
          setView('auth');
        } finally {
          setLoading(false);
        }
      }
    };
    handleIncomingLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser && view !== 'set-password') {
      navigate(redirectPath);
    }
  }, [currentUser, navigate, redirectPath, view]);

  const handleGoogleLogin = async () => {
    setLoading(true); clearErrors();
    try {
      await googleLogin();
    } catch (err) {
      setErrorMsg('Google sign-in was cancelled or failed.');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault(); clearErrors();
    if (!validateEmail(email)) { setErrorMsg('Please enter a valid email.'); return; }
    if (!agreeTerms) { setErrorMsg('Please agree to the Terms to continue.'); return; }

    setLoading(true);
    try {
      await sendVerificationMail(email);
      setView('link-sent'); 
    } catch (err) {
      setErrorMsg('Failed to send verification email. Please try again.');
    } finally { setLoading(false); }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault(); clearErrors();
    if (!validateEmail(email) || !password) { setErrorMsg('Email and password required.'); return; }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg('Incorrect email or password.');
      setLoading(false); 
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault(); clearErrors();
    
    // Require a "Strong" password (score of 4) based on your context rules
    if (!strength.isStrong) { 
      setErrorMsg('Password must be at least 8 characters and include uppercase, numbers, and special characters.'); 
      return; 
    }

    setLoading(true);
    try {
      await setupAccountPassword(password);
      setSuccessMsg('✓ Password set! Welcome to OneSip.');
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      setErrorMsg('Failed to save password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .auth-page { min-height: calc(100vh - 80px); display: grid; grid-template-columns: 1.1fr 0.9fr; position: relative; overflow: hidden; }
        
        .auth-brand { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 0; }
        .auth-brand-bg { position: absolute; inset: 0; background: linear-gradient(160deg, var(--ink) 0%, var(--card-bg) 40%, var(--ink) 100%); }
        .auth-brand-img { position: absolute; inset: 0; background-image: url('https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1000&q=80&auto=format&fit=crop'); background-size: cover; background-position: center; opacity: 0.18; filter: saturate(0.4); mix-blend-mode: luminosity; }
        .auth-brand-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 60px 60px; mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.8) 100%); }
        
        .auth-brand-orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .auth-brand-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(122,140,110,0.2) 0%, transparent 70%); top: -10%; left: -15%; animation: orbDrift 14s ease-in-out infinite alternate; }
        .auth-brand-orb-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%); bottom: 20%; right: -5%; animation: orbDrift 18s ease-in-out infinite alternate-reverse; }
        @keyframes orbDrift { from{transform:translate(0,0)} to{transform:translate(30px,20px)} }
        
        .brand-inner { position: relative; z-index: 1; padding: 5rem 4rem; animation: fadeUp 1.1s cubic-bezier(0.23,1,0.32,1) forwards; }
        .brand-eyebrow { display: inline-flex; align-items: center; gap: 1rem; font-size: 0.72rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); opacity: 0.8; margin-bottom: 2rem; }
        .brand-eyebrow-line { display: block; width: 40px; height: 1px; background: var(--gold); opacity: 0.5;}
        .brand-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem, 4.5vw, 5.5rem); font-weight: 300; line-height: 1.05; color: var(--cream); margin: 0 0 2rem; }
        .brand-headline em { font-style: italic; color: var(--gold); }
        .brand-desc { font-size: 0.95rem; line-height: 1.9; color: var(--text-dim); max-width: 360px; margin-bottom: 3.5rem; font-weight: 300; }
        
        .brand-perks { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 4rem; }
        .brand-perk { display: flex; align-items: center; gap: 1.2rem; font-size: 0.88rem; color: var(--text-dim); transition: color 0.3s; }
        .brand-perk:hover { color: var(--cream); }
        .perk-icon { width: 32px; height: 32px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--gold); flex-shrink: 0; transition: border-color 0.3s, background 0.3s; }
        .brand-perk:hover .perk-icon { border-color: var(--gold); background: var(--card-hover); }
        
        .brand-bottom { border-top: 1px solid var(--border); padding-top: 2rem; display: flex; align-items: center; gap: 2rem; }
        .brand-testimonial { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-style: italic; color: var(--text-dimmer); line-height: 1.6; }
        .brand-testimonial strong { color: var(--cream); font-style: normal; }
        
        .auth-panel { background: var(--ink); border-left: 1px solid var(--border); display: flex; align-items: center; justify-content: center; padding: 5rem 4rem 4rem; position: relative; }
        .auth-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, var(--gold), transparent); opacity: 0.3; }
        
        .auth-box { width: 100%; max-width: 420px; animation: fadeUp 1.1s 0.15s cubic-bezier(0.23,1,0.32,1) both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        
        .form-heading { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; font-weight: 300; line-height: 1.1; margin: 0 0 0.6rem; color: var(--cream); }
        .form-heading em { font-style: italic; color: var(--gold); }
        .form-subhead { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 2.5rem; line-height: 1.8; font-weight: 300; }
        
        .form-group { margin-bottom: 1.4rem; position: relative; }
        .form-label { font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-dimmer); display: block; margin-bottom: 0.6rem; transition: color 0.3s; }
        .form-group.focused .form-label, .form-group:focus-within .form-label { color: var(--gold); }
        
        .form-input { width: 100%; background: var(--glass); border: 1px solid var(--border); outline: none; color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.97rem; font-weight: 300; padding: 1rem 1.2rem; transition: border-color 0.3s, background 0.3s, box-shadow 0.3s; -webkit-appearance: none; box-sizing: border-box; }
        .form-input::placeholder { color: var(--text-dimmer); opacity: 0.6; }
        .form-input:focus { border-color: var(--gold); background: var(--card-hover); box-shadow: 0 0 0 3px var(--card-hover), inset 0 1px 0 var(--glass); }
        .form-input.error { border-color: rgba(201,112,112,0.5); background: rgba(201,112,112,0.02); }
        
        .google-btn { width: 100%; background: transparent; border: 1px solid var(--border); color: var(--cream); padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; margin-bottom: 1.5rem; }
        .google-btn:hover { background: var(--glass); border-color: var(--gold); }
        
        .form-check { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.8rem; cursor: pointer; }
        .form-check-input { width: 16px; height: 16px; min-width: 16px; appearance: none; -webkit-appearance: none; border: 1px solid var(--border); background: none; margin-top: 3px; cursor: pointer; transition: background 0.2s, border-color 0.2s; position: relative; }
        .form-check-input:checked { background: var(--gold); border-color: var(--gold); }
        .form-check-input:checked::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; color: var(--ink); font-weight: 700; }
        .form-check-label { font-size: 0.85rem; color: var(--text-dim); line-height: 1.6; }
        .form-check-label a { color: var(--gold); text-decoration: none; border-bottom: 1px solid var(--border); transition: border-color 0.3s; }
        .form-check-label a:hover { border-color: var(--gold); }
        
        .form-submit { width: 100%; background: var(--gold); color: var(--ink); border: none; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; padding: 1.2rem; cursor: pointer; margin-top: 0.5rem; position: relative; overflow: hidden; transition: background 0.3s, transform 0.2s, box-shadow 0.3s; }
        .form-submit::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent); transition: left 0.5s; }
        .form-submit:hover:not(:disabled)::before { left: 100%; }
        .form-submit:hover:not(:disabled) { background: var(--gold-hover); transform: translateY(-1px); box-shadow: 0 10px 35px var(--card-hover); }
        .form-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        
        .btn-text { display: inline-block; }
        .btn-spinner { display: none; width: 16px; height: 16px; border: 2px solid rgba(13,13,10,0.25); border-top-color: #0d0d0a; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-submit.loading .btn-text { display: none; }
        .form-submit.loading .btn-spinner { display: inline-block; }
        
        .form-divider { display: flex; align-items: center; gap: 1rem; margin: 1.8rem 0; }
        .form-divider-line { flex: 1; height: 1px; background: var(--border); }
        .form-divider-text { font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dimmer); }
        
        .form-switch { text-align: center; font-size: 0.85rem; color: var(--text-dimmer); margin-top: 1.5rem; }
        .form-switch button { background: none; border: none; color: var(--gold); cursor: pointer; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; border-bottom: 1px solid var(--border); padding-bottom: 1px; transition: border-color 0.3s; }
        .form-switch button:hover { border-color: var(--gold); }
        
        .form-message { margin-top: 1.2rem; font-size: 0.85rem; text-align: center; letter-spacing: 0.04em; line-height: 1.6; min-height: 1.4rem; }
        .msg-error { color: #c97070; }
        .msg-success { color: var(--sage); }
        
        /* ── NEW PASSWORD STRENGTH CSS ── */
        .strength-meter { display: flex; gap: 4px; margin-top: 8px; }
        .strength-bar { height: 4px; flex: 1; background: var(--border); border-radius: 2px; transition: background 0.3s; }
        .bar-1.active { background: #c97070; } /* Weak - Red */
        .bar-2.active { background: #d4b87e; } /* Fair - Yellow */
        .bar-3.active { background: var(--sage); } /* Good - Green */
        .bar-4.active { background: #5a7050; } /* Strong - Dark Green */
        .strength-text { font-size: 0.7rem; margin-top: 4px; color: var(--text-dimmer); text-align: right; letter-spacing: 0.05em; }

        @media (max-width: 960px) { .auth-page { grid-template-columns: 1fr; } .auth-brand { min-height: 320px; } .brand-inner { padding: 3rem 2rem; } .brand-bottom { display: none; } .auth-panel { padding: 4rem 2rem 3rem; } }
      `}</style>

      <div className="auth-page">
        {/* LEFT BRAND PANEL */}
        <div className="auth-brand">
          <div className="auth-brand-bg"></div>
          <div className="auth-brand-img"></div>
          <div className="auth-brand-grid"></div>
          <div className="auth-brand-orb auth-brand-orb-1"></div>
          <div className="auth-brand-orb auth-brand-orb-2"></div>
          <div className="brand-inner">
            <div className="brand-eyebrow"><span className="brand-eyebrow-line"></span>Member Portal</div>
            <h2 className="brand-headline">Your Wellness<br /><em>Journey</em><br />Awaits</h2>
            <p className="brand-desc">Access your curated beverage collection, manage your subscription, and track your hydration goals — all in one place.</p>
            <div className="brand-perks">
              {[
                { icon: '◈', text: 'Personalised beverage recommendations' },
                { icon: '◇', text: 'Manage your monthly hydration plan' },
                { icon: '✦', text: 'Order history & one-click reorders' }
              ].map(({ icon, text }, i) => (
                <div className="brand-perk" key={i}><span className="perk-icon">{icon}</span>{text}</div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="auth-panel">
          <div className="auth-box">
            
            {/* VIEW 1: SIGN UP / LOG IN */}
            {view === 'auth' && (
              <form onSubmit={isLoginMode ? handleEmailLogin : handleEmailSignUp}>
                <h2 className="form-heading">{isLoginMode ? 'Welcome' : 'Create'}<br /><em>{isLoginMode ? 'Back' : 'Account'}</em></h2>
                
                <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                  <GoogleIcon style={{ fontSize: '1.2rem' }} /> Continue with Google
                </button>

                <div className="form-divider">
                  <div className="form-divider-line"></div>
                  <span className="form-divider-text">or {isLoginMode ? 'log in' : 'sign up'} manually</span>
                  <div className="form-divider-line"></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder="you@example.com" />
                </div>

                {isLoginMode && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} placeholder="••••••••" />
                  </div>
                )}

                {!isLoginMode && (
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="agreeTerms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                    <label className="form-check-label" htmlFor="agreeTerms">I agree to the <Link to="/about">Terms of Service</Link></label>
                  </div>
                )}

                <button type="submit" className={`form-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  <span className="btn-text">{isLoginMode ? 'Log In' : 'Verify Email'}</span><span className="btn-spinner"></span>
                </button>

                <div className="form-switch">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); clearErrors(); }}>
                    {isLoginMode ? "Sign Up" : "Log In"}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 2: LINK SENT */}
            {view === 'link-sent' && (
              <div style={{ textAlign: 'center' }}>
                <h2 className="form-heading">Check Your<br /><em>Inbox</em></h2>
                <p className="form-subhead">We sent a secure verification link to <strong>{email}</strong>. Click it to continue.</p>
                <button type="button" className="google-btn" onClick={() => setView('auth')} style={{ marginTop: '2rem' }}>
                  Use a different email
                </button>
              </div>
            )}

            {/* VIEW 3: SET PASSWORD WITH STRENGTH METER */}
            {view === 'set-password' && (
              <form onSubmit={handleSetPassword}>
                <h2 className="form-heading">Secure Your<br /><em>Account</em></h2>
                <p className="form-subhead">Email verified! Set your password to complete registration.</p>
                
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoFocus placeholder="••••••••" />
                  
                  {/* PASSWORD STRENGTH UI */}
                  {password.length > 0 && (
                    <>
                      <div className="strength-meter">
                        <div className={`strength-bar bar-1 ${strength.score >= 1 ? 'active' : ''}`}></div>
                        <div className={`strength-bar bar-2 ${strength.score >= 2 ? 'active' : ''}`}></div>
                        <div className={`strength-bar bar-3 ${strength.score >= 3 ? 'active' : ''}`}></div>
                        <div className={`strength-bar bar-4 ${strength.score >= 4 ? 'active' : ''}`}></div>
                      </div>
                      <div className="strength-text">{getStrengthText()}</div>
                    </>
                  )}
                </div>

                <button type="submit" className={`form-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  <span className="btn-text">Save Password</span><span className="btn-spinner"></span>
                </button>
              </form>
            )}

            {errorMsg && <p className="form-message msg-error">{errorMsg}</p>}
            {successMsg && <p className="form-message msg-success">{successMsg}</p>}

          </div>
        </div>
      </div>
    </>
  );
}