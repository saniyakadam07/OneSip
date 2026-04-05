import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { currentUser } = useAuth();
  const { cartCount } = useCart();
  const [theme, setTheme] = useState(localStorage.getItem('onesip_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('onesip_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <>
      <style>{`
        .navbar { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.5rem 4rem; border-bottom:1px solid var(--border, rgba(201,169,110,0.2)); backdrop-filter:blur(20px); background:var(--ink-nav, rgba(13,13,10,0.82)); }
        .logo { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:300; letter-spacing:0.12em; color:var(--gold, #c9a96e); text-transform:uppercase; text-decoration:none; }
        nav { display:flex; align-items:center; gap:2.5rem; }
        nav a { color:var(--nav-link, #f5f0e8); text-decoration:none; font-size:0.82rem; letter-spacing:0.12em; text-transform:uppercase; position: relative; }
        
        /* BTO Badge Styling */
        .bto-badge { font-size: 0.55rem; background: var(--gold); color: var(--ink); padding: 1px 5px; border-radius: 2px; margin-left: 5px; vertical-align: middle; font-weight: bold; }
        
        .btn-nav { border:1px solid var(--border) !important; padding:0.5rem 1.4rem; border-radius:100px; color:var(--cream) !important; background:var(--glass); }
        .theme-toggle { width:52px; height:28px; background:var(--toggle-track); border:1px solid var(--border); border-radius:100px; position:relative; cursor:none; }
        .theme-toggle-thumb { position:absolute; left:4px; top:4px; width:18px; height:18px; border-radius:50%; background:var(--gold); transition:transform 0.4s; }
        [data-theme="light"] .theme-toggle-thumb { transform:translateX(24px); }
      `}</style>
      <header className="navbar">
        <Link to="/" className="logo">OneSip</Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">Why OneSip?</Link>
          <Link to="/products">Products</Link>
          
          {/* THE NEW PULL-MODEL LINK */}
          <Link to="/drink-lab">
            Drink Lab <span className="bto-badge">BTO</span>
          </Link>
          
          <Link to="/subscription">Subscription</Link>
          
          {currentUser && (
            <Link to="/cart">Cart ({cartCount})</Link>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-toggle-thumb" />
          </button>
          
          {currentUser ? (
            <Link to="/profile" className="btn-nav">My Account</Link>
          ) : (
            <Link to="/login" className="btn-nav">Login</Link>
          )}
        </nav>
      </header>
    </>
  );
}