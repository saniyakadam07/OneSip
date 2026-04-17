import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import AISommelier from './components/AISommelier';

// Import your AuthProvider!
import { AuthProvider } from './context/AuthContext';

// Import all pages including the NEW DrinkLab, InfoPage, and Support
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Subscription from './pages/Subscription';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import DrinkLab from './pages/DrinkLab';
import InfoPage from './pages/InfoPage'; // <--- NEW IMPORT
import Support from './pages/Support';   // <--- NEW IMPORT

export default function App() {
  return (
    // Wrap the entire app inside the AuthProvider
    <AuthProvider>
      <Router>
        <style>{`
          /* Core Theme Variables injected globally */
          :root {
              --ink: #0d0d0a; --ink-nav: rgba(13,13,10,0.82); --cream: #f5f0e8;
              --sage: #7a8c6e; --gold: #c9a96e; --gold-hover: #d4b07e;
              --border: rgba(201,169,110,0.2); --glass: rgba(245,240,232,0.06);
              --card-bg: #0d0d0a; --card-hover: rgba(201,169,110,0.04);
              --text-dim: rgba(245,240,232,0.55); --text-dimmer: rgba(245,240,232,0.38);
              --nav-link: rgba(245,240,232,0.65); --toggle-track: rgba(201,169,110,0.15);
          }
          [data-theme="light"] {
              --ink: #f7f3ec; --ink-nav: rgba(247,243,236,0.92); --cream: #1c1a14;
              --sage: #5a7050; --gold: #9a7038; --gold-hover: #b08040;
              --border: rgba(100,80,40,0.18); --glass: rgba(20,18,10,0.05);
              --card-bg: #f7f3ec; --card-hover: rgba(154,112,56,0.06);
              --text-dim: rgba(28,26,20,0.6); --text-dimmer: rgba(28,26,20,0.4);
              --nav-link: rgba(28,26,20,0.6); --toggle-track: rgba(154,112,56,0.15);
          }
          body { background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; transition: background 0.4s, color 0.4s; margin: 0; min-height: 100vh;}
        `}</style>
        
        <CustomCursor />
        <Navbar />
        
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 100px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/drink-lab" element={<DrinkLab />} /> 
            
            {/* NEW ROUTES FOR DYNAMIC FOOTER & CUSTOMER SUPPORT */}
            <Route path="/info/:pageId" element={<InfoPage />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>

        <Footer />
        <AISommelier />
      </Router>
    </AuthProvider>
  );
}