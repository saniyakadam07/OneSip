import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <>
      <style>{`
        .product-card { background:var(--card-bg, #0d0d0a); border: 1px solid var(--border); display:flex; flex-direction:column; position:relative; overflow:hidden; transition:transform 0.4s, border-color 0.4s; cursor:none; }
        .product-card:hover { transform: translateY(-8px); border-color: rgba(201,169,110,0.5); }
        .product-img { width:100%; height:220px; object-fit:cover; }
        .product-body { padding:2.2rem 2.5rem 2.5rem; display:flex; flex-direction:column; flex:1; }
        .product-tag { font-size:0.62rem; letter-spacing:0.15em; text-transform:uppercase; padding:0.3rem 0.8rem; border-radius:100px; border:1px solid; width:fit-content; margin-bottom:1.2rem; }
        .btn-cart { width:100%; background:none; border:1px solid var(--border); color:var(--cream); padding:0.95rem; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.14em; margin-top:1.2rem; cursor:none; transition:background 0.3s; }
        .btn-cart:hover { background:var(--gold); color:var(--ink); }
      `}</style>
      <div className="product-card">
        <img src={product.img} alt={product.name} className="product-img" />
        <div className="product-body">
          <span className="product-tag" style={{ color: 'var(--sage)', borderColor: 'rgba(122,140,110,0.35)' }}>{product.category}</span>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.55rem', marginBottom: '0.5rem' }}>{product.name}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dimmer)', flex: 1 }}>{product.desc}</p>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', color: 'var(--gold)', marginTop: '1.4rem' }}>₹{product.price}</div>
          <button className="btn-cart" onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      </div>
    </>
  );
}