import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default function Products() {
  const { cart, addToCart, cartCount } = useCart();
  const { currentUser } = useAuth(); 
  const navigate = useNavigate();

  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [toast, setToast] = useState({ msg: '', type: '', visible: false });
  const [hoveredCard, setHoveredCard] = useState(null);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const liveProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductsData(liveProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const processedProducts = useMemo(() => {
    let filtered = productsData.filter(p => filter === 'all' || p.type === filter);
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [productsData, filter, sort]);

  const recommendations = useMemo(() => {
    const addedNames = cart.map(c => c.name);
    return productsData.filter(p => !addedNames.includes(p.name)).slice(0, 4);
  }, [productsData, cart]);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [processedProducts, loading]);

  const showToast = (msgHTML, type = 'info') => {
    setToast({ msg: msgHTML, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2800);
  };

  const handleAddToCart = (product) => {
    if (!currentUser) {
      navigate('/login?redirect=/products');
      return; 
    }

    const stock = product.stockQuantity;
    const inCart = cart.find(i => i.name === product.name)?.qty || 0;
    if (stock <= 0) { showToast(`<span>${product.name}</span> is out of stock`, 'err'); return; }
    if (inCart >= stock) { showToast(`Max stock reached for <span>${product.name}</span>`, 'warn'); return; }
    
    addToCart(product);
    
    const remaining = stock - (inCart + 1);
    if (remaining <= 5 && remaining > 0) showToast(`Added <span>${product.name}</span> — only ${remaining} left!`, 'warn');
    else showToast(`Added <span>${product.name}</span> to cart`, 'info');
  };

  const getStockUI = (product) => {
    const stock = product.stockQuantity;
    const inCart = cart.find(i => i.name === product.name)?.qty || 0;
    const remaining = stock - inCart;
    let badge = { text: `In Stock`, cls: 'stock-ok' };
    let btnState = { disabled: false, text: 'Add to Cart', cls: '' };
    let cardCls = '';
    
    if (stock <= 0) {
      badge = { text: 'Out of Stock', cls: 'stock-out' };
      btnState = { disabled: true, text: 'Out of Stock', cls: '' };
      cardCls = 'out-of-stock';
    } else if (stock <= 5) {
      badge = { text: `Only ${stock} left`, cls: 'stock-low' };
    } else if (stock <= 10) {
      badge = { text: `Only ${stock} left`, cls: 'stock-low' };
    }
    
    if (stock > 0 && remaining <= 0) {
      btnState = { disabled: true, text: 'Max Reached', cls: 'added' };
    }
    
    return { badge, btnState, cardCls };
  };

  const filterCategories = [
    { key: 'all', label: 'All Products' },
    { key: 'sugarfree', label: 'Sugar-Free' },
    { key: 'protein', label: 'Protein-Rich' },
    { key: 'vegan', label: 'Vegan' },
    { key: 'detox', label: 'Detox' },
    { key: 'energy', label: 'Energy' },
  ];

  return (
    <>
      <style>{`
        /* HERO */
        .products-hero {
          padding: 7rem 4rem 5rem;
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
        }

        .products-hero-inner {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 5rem;
          align-items: end;
          padding-bottom: 4rem;
          border-bottom: 1px solid var(--border);
          animation: fadeUp 1s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 1rem;
          font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--sage); margin-bottom: 1.5rem;
        }
        .eyebrow-line { display: block; width: 30px; height: 1px; background: var(--sage); }

        .products-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 7vw, 6.5rem);
          font-weight: 300; line-height: 1.05; margin: 0;
        }
        .products-hero h1 em { font-style: italic; color: var(--gold); }

        .hero-right { padding-bottom: 0.5rem; }
        .hero-right p {
          font-size: 1rem; line-height: 1.9; color: var(--text-dim);
          margin: 0 0 2.5rem; font-weight: 300;
        }

        .hero-stats { display: flex; gap: 0; }
        .hero-stat {
          padding: 1.5rem 2.5rem 1.5rem 0;
          border-right: 1px solid var(--border);
          margin-right: 2.5rem;
        }
        .hero-stat:last-child { border-right: none; margin-right: 0; }
        .hero-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300;
          color: var(--gold); display: block; line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.66rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--text-dimmer);
          display: block; margin-top: 0.4rem;
        }

        /* SCROLLING CATEGORY PILLS */
        .category-scroll {
          max-width: 1300px; margin: 0 auto;
          padding: 3rem 4rem 0;
          display: flex; gap: 1px;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        .cat-pill {
          flex: 1; padding: 1.2rem 1rem;
          background: none; border: none;
          border-bottom: 1px solid var(--border);
          border-top: 1px solid var(--border);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-dimmer);
          cursor: pointer; text-align: center;
          transition: background 0.3s, color 0.3s;
          position: relative; overflow: hidden;
          white-space: nowrap;
        }
        .cat-pill + .cat-pill { border-left: 1px solid var(--border); }
        .cat-pill::before {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--gold); transform: scaleX(0);
          transform-origin: center; transition: transform 0.4s;
        }
        .cat-pill.active { color: var(--gold); background: rgba(201,169,110,0.05); }
        .cat-pill.active::before { transform: scaleX(1); }
        .cat-pill:hover:not(.active) { color: var(--cream); background: rgba(245,240,232,0.02); }
        .cat-count {
          display: inline-block; margin-left: 0.4rem;
          font-size: 0.6rem; color: var(--sage); opacity: 0.6;
        }

        /* TOOLBAR */
        .products-toolbar {
          max-width: 1300px; margin: 0 auto;
          padding: 2rem 4rem 0;
          display: flex; justify-content: space-between; align-items: center;
        }
        .products-count {
          font-size: 0.8rem; color: var(--text-dimmer); letter-spacing: 0.06em;
        }
        .products-count strong { color: var(--cream); font-weight: 400; }

        .sort-wrap { display: flex; align-items: center; gap: 0.8rem; }
        .sort-label {
          font-size: 0.68rem; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--text-dimmer);
        }
        .sort-select {
          background: rgba(245,240,232,0.03);
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 0.55rem 1rem;
          cursor: pointer; appearance: none; outline: none;
          transition: border-color 0.3s;
        }
        .sort-select:focus { border-color: rgba(201,169,110,0.4); }

        /* PRODUCTS GRID */
        .products-section {
          max-width: 1300px; margin: 0 auto;
          padding: 2.5rem 4rem 8rem;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .product-card {
          border: 1px solid var(--border);
          background: var(--card-bg);
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), border-color 0.4s, box-shadow 0.5s;
          cursor: pointer;
        }
        .product-card:hover {
          transform: translateY(-6px);
          border-color: rgba(201,169,110,0.4);
          box-shadow: 0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,169,110,0.1);
        }
        .product-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          transform: scaleX(0); transform-origin: center;
          transition: transform 0.5s; z-index: 2;
        }
        .product-card:hover::before { transform: scaleX(1); }
        .product-card.fade-in { animation: cardIn 0.55s cubic-bezier(0.23,1,0.32,1) both; }
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .product-card.out-of-stock { opacity: 0.5; filter: grayscale(0.3); }

        .product-img-wrap {
          width: 100%; height: 240px; overflow: hidden;
          position: relative; flex-shrink: 0;
        }
        .product-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.23,1,0.32,1), filter 0.5s;
          filter: saturate(0.7) brightness(0.85);
        }
        .product-card:hover .product-img-wrap img {
          transform: scale(1.07);
          filter: saturate(0.95) brightness(0.95);
        }
        .product-img-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(13,13,10,0.85) 100%);
          pointer-events: none;
        }

        .product-body { padding: 2rem 2.2rem 2.5rem; display: flex; flex-direction: column; flex: 1; }

        .product-tag {
          display: inline-block; width: fit-content;
          margin-bottom: 1rem; font-size: 0.6rem;
          letter-spacing: 0.16em; text-transform: uppercase;
          padding: 0.28rem 0.8rem; border-radius: 100px; border: 1px solid;
        }
        
        /* Dynamic tag colors generated by product.type */
        .tag-sugarfree { color: var(--sage); border-color: rgba(122,140,110,0.35); }
        .tag-protein { color: #a8c4e0; border-color: rgba(168,196,224,0.35); }
        .tag-vegan { color: #b8d4a0; border-color: rgba(184,212,160,0.35); }
        .tag-detox { color: #c9d4a0; border-color: rgba(201,212,160,0.35); }
        .tag-energy { color: #e0c4a8; border-color: rgba(224,196,168,0.35); }

        .product-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 400;
          margin: 0 0 0.5rem; line-height: 1.2;
        }
        .product-desc {
          font-size: 0.82rem; color: var(--text-dimmer);
          line-height: 1.75; margin-bottom: auto; font-weight: 300;
        }

        .product-footer { margin-top: 1.5rem; }
        .product-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300; color: var(--gold);
          margin-bottom: 0.5rem; display: block; line-height: 1;
        }
        .product-price sup { font-size: 0.85rem; vertical-align: super; }

        .stock-badge {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-size: 0.65rem; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 1.2rem;
        }
        .stock-badge::before {
          content: ''; width: 5px; height: 5px;
          border-radius: 50%; flex-shrink: 0;
        }
        .stock-badge.stock-ok { color: rgba(122,140,110,0.65); }
        .stock-badge.stock-ok::before { background: rgba(122,140,110,0.65); }
        .stock-badge.stock-low { color: rgba(201,169,110,0.85); }
        .stock-badge.stock-low::before { background: rgba(201,169,110,0.85); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .stock-badge.stock-out { color: rgba(201,112,112,0.8); }
        .stock-badge.stock-out::before { background: rgba(201,112,112,0.8); }

        /* DYNAMIC THEME FIX FOR ADD TO CART BUTTONS */
        .btn-cart {
          width: 100%;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.16em;
          text-transform: uppercase; padding: 1rem;
          cursor: pointer;
          transition: background 0.3s, border-color 0.3s, color 0.3s;
          position: relative; overflow: hidden;
        }
        .btn-cart::before {
          content: ''; position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(201,169,110,0.1), transparent);
          transition: left 0.4s;
        }
        .btn-cart:hover:not(:disabled)::before { left: 100%; }
        .btn-cart:hover:not(:disabled) {
          background: var(--gold); border-color: var(--gold); color: var(--ink);
        }
        .btn-cart.added { background: rgba(122,140,110,0.1); border-color: rgba(122,140,110,0.3); color: var(--sage); }
        .btn-cart:disabled { opacity: 0.35; cursor: not-allowed; }

        /* FLOATING CART (Only renders if cartCount > 0 and user is logged in) */
        .cart-badge {
          position: fixed; bottom: 6.5rem; right: 1.5rem; z-index: 200;
          background: var(--gold); color: var(--ink);
          border-radius: 100px; padding: 0.9rem 1.8rem;
          font-size: 0.72rem; letter-spacing: 0.14em;
          text-transform: uppercase; font-weight: 500;
          display: flex; align-items: center; gap: 0.8rem;
          transform: translateY(80px); opacity: 0;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.5s;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 12px 40px rgba(201,169,110,0.35);
        }
        .cart-badge.show { transform: translateY(0); opacity: 1; }
        .cart-badge-count {
          width: 22px; height: 22px; background: var(--ink); color: var(--gold);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 0.68rem; font-weight: 500;
        }

        /* TOAST */
        .toast {
          position: fixed; top: 6rem; right: 2rem; z-index: 300;
          background: rgba(13,13,10,0.95);
          border: 1px solid rgba(245,240,232,0.1);
          backdrop-filter: blur(20px); padding: 1rem 1.6rem;
          font-size: 0.8rem; color: var(--cream);
          opacity: 0; transform: translateX(20px);
          transition: opacity 0.4s, transform 0.4s;
          pointer-events: none; white-space: nowrap;
          border-left: 2px solid var(--gold);
        }
        .toast.show { opacity: 1; transform: translateX(0); }
        .toast span { color: var(--gold); }
        .toast.warn { border-left-color: rgba(201,169,110,0.8); }
        .toast.warn span { color: rgba(201,169,110,0.9); }
        .toast.err { border-left-color: rgba(201,112,112,0.8); }
        .toast.err span { color: rgba(201,112,112,0.85); }

        /* LOADING */
        .loading-state {
          grid-column: 1/-1;
          padding: 6rem 0; text-align: center;
        }
        .loading-dots {
          display: inline-flex; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem;
        }
        .loading-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--gold);
          animation: dotPop 1.2s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotPop { 0%,100%{transform:scale(0.5);opacity:0.3} 50%{transform:scale(1);opacity:1} }
        .loading-text {
          display: block; font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-style: italic; color: var(--text-dimmer);
        }

        /* RECOMMENDATIONS */
        .rec-section {
          border-top: 1px solid var(--border);
          padding: 7rem 4rem 9rem;
        }
        .rec-inner { max-width: 1300px; margin: 0 auto; }
        .rec-header {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 4rem;
          padding-bottom: 3rem; border-bottom: 1px solid var(--border);
        }
        .section-label { font-size: 0.72rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--sage); display: block; margin-bottom: 0.8rem; }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem, 3vw, 3.2rem); font-weight: 300; margin: 0; }
        .section-title em { font-style: italic; color: var(--gold); }

        .rec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .rec-card {
          border: 1px solid var(--border); background: var(--glass);
          position: relative; overflow: hidden;
          transition: border-color 0.4s, transform 0.4s cubic-bezier(0.23,1,0.32,1);
          cursor: pointer;
        }
        .rec-card:hover { border-color: rgba(201,169,110,0.4); transform: translateY(-5px); }
        .rec-img { width: 100%; height: 150px; overflow: hidden; }
        .rec-img img {
          width: 100%; height: 100%; object-fit: cover;
          filter: saturate(0.65) brightness(0.8);
          transition: transform 0.6s cubic-bezier(0.23,1,0.32,1), filter 0.4s;
        }
        .rec-card:hover .rec-img img { transform: scale(1.06); filter: saturate(0.9) brightness(0.9); }
        .rec-img::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to bottom, transparent, var(--card-bg));
          pointer-events: none;
        }
        .rec-body { padding: 1.5rem 1.8rem 2rem; }
        .rec-tag { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--sage); display: block; margin-bottom: 0.6rem; }
        .rec-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 400; margin: 0 0 0.3rem; }
        .rec-card p { font-size: 0.78rem; color: var(--text-dimmer); margin: 0 0 1.2rem; line-height: 1.6; }
        .rec-footer { display: flex; justify-content: space-between; align-items: center; }
        .rec-price { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: var(--gold); }
        .rec-empty {
          grid-column: 1/-1; text-align: center; padding: 3rem;
          font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
          font-style: italic; color: var(--text-dimmer); opacity: 0.5;
        }

        .reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 1080px) {
          .products-hero-inner { grid-template-columns: 1fr; gap: 3rem; }
          .product-grid { grid-template-columns: 1fr 1fr; }
          .rec-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .products-hero, .products-section, .rec-section { padding-left: 2rem; padding-right: 2rem; }
          .product-grid, .rec-grid { grid-template-columns: 1fr; }
          .category-scroll { padding-left: 2rem; padding-right: 2rem; overflow-x: auto; }
          .products-toolbar { padding-left: 2rem; padding-right: 2rem; }
        }
      `}</style>

      {/* Floating cart only visible if there are items AND the user is logged in */}
      {currentUser && (
        <Link to="/cart" className={`cart-badge ${cartCount > 0 ? 'show' : ''}`}>
          <span>My Cart</span>
          <span className="cart-badge-count">{cartCount}</span>
        </Link>
      )}

      <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>
        <span dangerouslySetInnerHTML={{ __html: toast.msg }}></span>
      </div>

      {/* HERO */}
      <div className="products-hero">
        <div className="products-hero-inner">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line"></span>
              The Collection
            </div>
            <h1>Our Beverage<br /><em>Collection</em></h1>
          </div>
          <div className="hero-right">
            <p>Discover premium hydration options curated for your lifestyle — from sugar-free teas to high-protein shakes, each product is chosen for purity and purpose.</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">{loading ? '—' : productsData.length}+</span>
                <span className="hero-stat-label">Products</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">6</span>
                <span className="hero-stat-label">Categories</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">Free</span>
                <span className="hero-stat-label">Shipping ₹499+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div className="category-scroll reveal">
        {filterCategories.map(({ key, label }) => (
          <button
            key={key}
            className={`cat-pill ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="cat-count">
              {key === 'all' ? productsData.length : productsData.filter(p => p.type === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="products-toolbar reveal">
        <span className="products-count">
          Showing <strong>{processedProducts.length}</strong> product{processedProducts.length !== 1 ? 's' : ''}
        </span>
        <div className="sort-wrap">
          <span className="sort-label">Sort</span>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="products-section">
        {loading ? (
          <div className="product-grid">
            <div className="loading-state">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <span className="loading-text">Fetching live inventory…</span>
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {processedProducts.map((product, index) => {
              const { badge, btnState, cardCls } = getStockUI(product);
              return (
                <div
                  key={`${product.id}-${filter}-${sort}`}
                  className={`product-card fade-in ${cardCls}`}
                  style={{ animationDelay: `${index * 0.06}s` }}
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="product-img-wrap">
                    <img src={product.img} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-body">
                    {/* Dynamically assign the tag color based on product type */}
                    <span className={`product-tag tag-${product.type || 'vegan'}`}>{product.tag}</span>
                    <h3>{product.name}</h3>
                    <p className="product-desc">{product.desc}</p>
                    <div className="product-footer">
                      <div className="product-price"><sup>₹</sup>{product.price}</div>
                      <div className={`stock-badge ${badge.cls}`}>{badge.text}</div>
                      <button
                        className={`btn-cart ${btnState.cls}`}
                        disabled={btnState.disabled}
                        onClick={() => handleAddToCart(product)}
                      >
                        {btnState.text}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECOMMENDATIONS */}
      <section className="rec-section">
        <div className="rec-inner">
          <div className="rec-header reveal">
            <div>
              <span className="section-label">Curated for You</span>
              <h2 className="section-title">You Might Also <em>Love</em></h2>
            </div>
          </div>
          <div className="rec-grid">
            {recommendations.length === 0 ? (
              <p className="rec-empty">You've explored our full collection!</p>
            ) : (
              recommendations.map((p, i) => (
                <div
                  key={`rec-${p.id}`}
                  className="rec-card"
                  style={{ animation: `cardIn 0.6s ${i * 0.1}s cubic-bezier(0.23,1,0.32,1) both` }}
                >
                  <div className="rec-img">
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </div>
                  <div className="rec-body">
                    <span className={`rec-tag tag-${p.type || 'vegan'}`}>{p.tag}</span>
                    <h3>{p.name}</h3>
                    <p>{p.desc}</p>
                    <div className="rec-footer">
                      <span className="rec-price">₹{p.price}</span>
                      <button
                        className="btn-cart"
                        style={{ width: 'auto', padding: '0.65rem 1.2rem', margin: 0 }}
                        onClick={() => handleAddToCart(p)}
                        disabled={getStockUI(p).btnState.disabled}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}