import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function Cart() {
  // Pulled clearCart in case your context requires it to clear localStorage
  const { cart, setCart, cartCount, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ── RAZORPAY CONFIGURATION ──
  const RAZORPAY_KEY = 'rzp_test_SUK9ik1lwRb6xa'; // <-- Your Test Key

  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart | address | confirm
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', city: '', pin: '' });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const VALID_PROMO = 'SIP15';
  const PROMO_DISCOUNT = 0.15;
  const GST_RATE = 0.18; // 18% Standard GST for supplements/beverages

  // ── HELPER TO HANDLE VARIABLE NAMING ──
  const getQty = (item) => item.qty !== undefined ? item.qty : (item.quantity || 1);

  // ── ECO-IMPACT LOGIC ──
  const calculateEcoScore = (items) => {
    return items.reduce((acc, item) => acc + (getQty(item) * 50), 0);
  };
  const ecoImpact = calculateEcoScore(cart);

  const updateQty = (name, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.name === name) {
            return { ...item, qty: getQty(item) + delta };
          }
          return item;
        })
        .filter(item => getQty(item) > 0)
    );
  };

  const removeItem = (name) => setCart(prev => prev.filter(item => item.name !== name));

  // ── NEW: CLEAR CART LOGIC ──
  const handleEmptyCart = () => {
    if (clearCart) {
      clearCart();
    } else {
      setCart([]);
    }
  };

  // ── REAL-WORLD E-COMMERCE MATH ──
  const subtotal = cart.reduce((sum, item) => sum + item.price * getQty(item), 0);
  const discount = promoApplied ? Math.round(subtotal * PROMO_DISCOUNT) : 0;
  
  // Tax is calculated on the amount AFTER the discount is applied
  const taxableAmount = subtotal - discount;
  const taxAmount = Math.round(taxableAmount * GST_RATE);
  
  // Shipping logic (Free if taxable amount is over ₹499)
  const shipping = taxableAmount >= 499 || taxableAmount === 0 ? 0 : 49;
  
  // Final Total
  const total = taxableAmount + taxAmount + shipping;

  const handlePromo = () => {
    if (promoInput.trim().toUpperCase() === VALID_PROMO) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  // ── DYNAMICALLY LOAD RAZORPAY SCRIPT ──
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => { resolve(true); };
      script.onerror = () => { resolve(false); };
      document.body.appendChild(script);
    });
  };

  // ── MAIN CHECKOUT FUNCTION ──
  const handlePlaceOrder = async () => {
    if (!currentUser) { navigate('/login?redirect=/cart'); return; }
    
    setPlacingOrder(true);

    // 1. Load Razorpay SDK
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setPlacingOrder(false);
      return;
    }

    // 2. Set up Razorpay Options
    const options = {
      key: RAZORPAY_KEY, 
      amount: total * 100, // Amount is in paise (multiply by 100)
      currency: "INR",
      name: "OneSip Wellness",
      description: "Premium Beverage Order",
      image: "https://cdn-icons-png.flaticon.com/512/3142/3142765.png", // Optional logo
      handler: async function (response) {
        // 3. THIS RUNS ONLY IF PAYMENT IS SUCCESSFUL
        try {
          const docRef = await addDoc(collection(db, 'orders'), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            items: cart.map(i => ({ 
              name: i.name, 
              qty: getQty(i), 
              price: i.price,
              isBTO: i.isBTO || false,
              recipe: i.recipe || null,
              volume: i.volume || null
            })),
            shippingAddress: address,
            // Saving the full financial breakdown to Firebase
            subtotal, 
            discount, 
            taxAmount, 
            shipping, 
            totalAmount: total,
            promoCode: promoApplied ? VALID_PROMO : null,
            paymentStatus: 'Paid', 
            razorpayPaymentId: response.razorpay_payment_id, 
            ecoImpactGenerated: ecoImpact, 
            createdAt: new Date().toISOString(),
          });
          
          setOrderId(docRef.id);
          
          // Bulletproof clearing of the cart upon successful order
          handleEmptyCart();
          
          setOrderPlaced(true);
          setCheckoutStep('confirm');
        } catch (err) {
          console.error('Firebase save failed:', err);
          alert("Payment successful, but order saving failed. Contact support.");
        } finally {
          setPlacingOrder(false);
        }
      },
      prefill: {
        name: address.name,
        email: currentUser.email,
        contact: address.phone
      },
      theme: {
        color: "#c9a96e" 
      }
    };

    // 4. Open the Razorpay Modal
    const paymentObject = new window.Razorpay(options);
    
    // Handle modal closure by user
    paymentObject.on('payment.failed', function (response){
      alert(`Payment Failed: ${response.error.description}`);
      setPlacingOrder(false);
    });

    paymentObject.open();
  };

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════
            CART PAGE — PREMIUM EDITORIAL
         ═══════════════════════════════════════════════ */

        .cart-page {
          min-height: calc(100vh - 80px);
          max-width: 1300px;
          margin: 0 auto;
          padding: 6rem 4rem 8rem;
          animation: fadeUp 0.9s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        /* Page Header */
        .cart-header { margin-bottom: 3.5rem; padding-bottom: 2.5rem; border-bottom: 1px solid var(--border); }
        .cart-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem;
          font-size: 0.7rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--sage); margin-bottom: 1rem;
        }
        .cart-eyebrow-line { display: block; width: 24px; height: 1px; background: var(--sage); }
        .cart-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 300; line-height: 1.05; margin: 0;
        }
        .cart-header h1 em { font-style: italic; color: var(--gold); }

        /* Steps */
        .checkout-steps {
          display: flex; align-items: center; gap: 0;
          margin-top: 2rem;
        }
        .step {
          display: flex; align-items: center; gap: 0.7rem;
          font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-dimmer);
        }
        .step.active { color: var(--gold); }
        .step.done { color: var(--sage); }
        .step-num {
          width: 24px; height: 24px; border-radius: 50%;
          border: 1px solid rgba(245,240,232,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 500;
          transition: border-color 0.3s, background 0.3s;
        }
        .step.active .step-num { border-color: var(--gold); color: var(--gold); }
        .step.done .step-num { background: rgba(122,140,110,0.15); border-color: rgba(122,140,110,0.4); color: var(--sage); }
        .step-line { flex: 1; max-width: 60px; height: 1px; background: rgba(245,240,232,0.08); margin: 0 1rem; }

        /* Grid Layout */
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 3rem;
          align-items: start;
        }

        /* CART ITEMS */
        .cart-items { display: flex; flex-direction: column; gap: 0; }

        .cart-item {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 2rem; align-items: center;
          padding: 2rem 0;
          border-bottom: 1px solid var(--border);
          transition: background 0.3s;
          position: relative;
        }
        .cart-item:first-child { border-top: 1px solid var(--border); }
        .cart-item::before {
          content: ''; position: absolute;
          left: -2rem; top: 0; bottom: 0; width: 2px;
          background: var(--gold); transform: scaleY(0);
          transform-origin: top; transition: transform 0.4s;
        }
        .cart-item:hover::before { transform: scaleY(1); }

        .cart-item-img {
          width: 100px; height: 80px; overflow: hidden;
          border: 1px solid var(--border); flex-shrink: 0;
          background: var(--card-bg);
        }
        .cart-item-img img {
          width: 100%; height: 100%; object-fit: cover;
          filter: saturate(0.7) brightness(0.85);
          transition: filter 0.4s;
        }
        .cart-item:hover .cart-item-img img { filter: saturate(0.9) brightness(0.95); }

        .cart-item-info { min-width: 0; }
        .cart-item-tag {
          font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--sage); display: block; margin-bottom: 0.4rem;
        }
        
        /* BTO Specific Tag */
        .cart-item-tag.bto-tag {
          color: var(--gold); border: 1px solid var(--gold);
          padding: 2px 6px; border-radius: 2px; display: inline-block;
          background: rgba(201,169,110,0.1);
        }

        .cart-item-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-weight: 400; margin: 0 0 0.3rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cart-item-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; color: var(--gold);
        }
        
        /* BTO Recipe List */
        .bto-recipe-details {
          font-size: 0.8rem; color: var(--text-dim); margin-top: 0.4rem; line-height: 1.4;
        }
        .bto-recipe-details span { color: var(--cream); opacity: 0.9; }

        .cart-item-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 1rem; }
        .qty-control {
          display: flex; align-items: center; gap: 0;
          border: 1px solid var(--border);
        }
        .qty-btn {
          width: 32px; height: 32px;
          background: none; border: none;
          color: var(--cream); cursor: pointer;
          font-size: 1rem; font-weight: 300;
          transition: background 0.3s, color 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .qty-btn:hover { background: rgba(201,169,110,0.1); color: var(--gold); }
        .qty-num {
          width: 36px; text-align: center;
          font-size: 0.88rem; color: var(--cream);
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          height: 32px; display: flex; align-items: center; justify-content: center;
        }
        .remove-btn {
          background: none; border: none;
          font-size: 0.65rem; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-dimmer);
          cursor: pointer; transition: color 0.3s;
        }
        .remove-btn:hover { color: rgba(201,112,112,0.7); }

        /* Clear Cart Button */
        .btn-clear-cart {
          background: none; border: none;
          color: rgba(201,112,112,0.7);
          font-size: 0.75rem; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer;
          transition: color 0.3s;
          padding: 0; text-decoration: underline;
        }
        .btn-clear-cart:hover { color: rgba(201,112,112,1); }

        /* EMPTY STATE */
        .cart-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 6rem 0;
          border: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .cart-empty::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .empty-icon {
          font-size: 3rem; display: block;
          margin-bottom: 1.5rem; opacity: 0.3;
        }
        .empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem; font-weight: 300;
          color: var(--text-dim); margin-bottom: 0.8rem;
        }
        .empty-desc { font-size: 0.9rem; color: var(--text-dimmer); margin-bottom: 2.5rem; }
        .btn-shop {
          display: inline-block;
          background: var(--gold); color: var(--ink);
          padding: 1rem 2.5rem; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase;
          font-weight: 500; transition: background 0.3s, transform 0.2s;
        }
        .btn-shop:hover { background: var(--gold-hover); transform: translateY(-1px); }

        /* ORDER SUMMARY */
        .order-summary {
          border: 1px solid var(--border);
          background: rgba(245,240,232,0.01);
          position: sticky; top: 7rem; overflow: hidden;
        }
        .order-summary::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .summary-head {
          padding: 2rem 2.5rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .summary-label {
          font-size: 0.68rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--text-dimmer);
          display: block; margin-bottom: 0.5rem;
        }
        .summary-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 300; margin: 0;
        }
        .summary-title em { font-style: italic; color: var(--gold); }

        .summary-body { padding: 1.8rem 2.5rem; }

        .summary-row {
          display: flex; justify-content: space-between;
          align-items: center; padding: 0.7rem 0;
          font-size: 0.88rem; color: var(--text-dim);
          border-bottom: 1px solid rgba(245,240,232,0.05);
        }
        .summary-row:last-of-type { border-bottom: none; }
        .summary-row.total {
          padding-top: 1.2rem; margin-top: 0.5rem;
          border-top: 1px solid var(--border) !important;
          border-bottom: none !important;
        }
        .summary-row.total .s-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; color: var(--cream);
        }
        .summary-row.total .s-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; color: var(--gold);
        }
        .s-label { font-size: 0.85rem; }
        .s-val { font-weight: 400; color: var(--cream); }
        .s-val.green { color: var(--sage); }
        .s-val.free {
          font-size: 0.7rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--sage);
          border: 1px solid rgba(122,140,110,0.3);
          padding: 0.2rem 0.5rem; border-radius: 100px;
        }

        /* ── ECO IMPACT WIDGET STYLES ── */
        .eco-impact-widget {
          margin: 1rem 2.5rem 2rem;
          background: rgba(122, 140, 110, 0.08);
          border: 1px solid rgba(122, 140, 110, 0.25);
          border-radius: 8px;
          padding: 1.2rem;
          display: flex; gap: 1rem; align-items: center;
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .eco-icon { font-size: 1.8rem; }
        .eco-text h4 { 
          margin: 0; font-size: 0.75rem; letter-spacing: 0.1em; 
          text-transform: uppercase; color: var(--sage); 
        }
        .eco-text p { 
          margin: 0.3rem 0 0; font-size: 0.82rem; color: var(--text-dim); line-height: 1.4; 
        }
        .eco-text strong { color: var(--sage); font-weight: 600; }

        /* Promo */
        .promo-wrap {
          padding: 1.2rem 2.5rem;
          border-top: 1px solid var(--border);
          display: flex; gap: 0.5rem;
        }
        .promo-input {
          flex: 1; background: rgba(245,240,232,0.02);
          border: 1px solid rgba(245,240,232,0.08); outline: none;
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; padding: 0.7rem 1rem;
          text-transform: uppercase; letter-spacing: 0.1em;
          transition: border-color 0.3s;
        }
        .promo-input:focus { border-color: rgba(201,169,110,0.4); }
        .promo-input::placeholder { opacity: 0.35; text-transform: none; letter-spacing: 0; }
        .promo-btn {
          background: rgba(201,169,110,0.1);
          border: 1px solid rgba(201,169,110,0.25);
          color: var(--gold); padding: 0 1.2rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.3s;
          white-space: nowrap;
        }
        .promo-btn:hover { background: rgba(201,169,110,0.18); }
        .promo-success { color: var(--sage); font-size: 0.75rem; padding: 0.3rem 2.5rem; }
        .promo-error { color: rgba(201,112,112,0.8); font-size: 0.75rem; padding: 0.3rem 2.5rem; }

        /* CTA */
        .summary-cta { padding: 0 2.5rem 2.5rem; }
        .btn-checkout {
          width: 100%; background: var(--gold); color: var(--ink);
          border: none; padding: 1.2rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase;
          font-weight: 500; cursor: pointer;
          position: relative; overflow: hidden;
          transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .btn-checkout::before {
          content: ''; position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s;
        }
        .btn-checkout:hover::before { left: 100%; }
        .btn-checkout:hover { background: var(--gold-hover); transform: translateY(-1px); box-shadow: 0 10px 35px rgba(201,169,110,0.3); }
        .btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .summary-note {
          text-align: center; font-size: 0.72rem;
          color: var(--text-dimmer); margin-top: 1rem; line-height: 1.6;
        }

        /* ADDRESS FORM */
        .address-form { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); }
        .addr-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border); }
        .addr-row:last-of-type { border-bottom: none; }
        .addr-field { padding: 1.8rem 2rem; border-right: 1px solid var(--border); }
        .addr-field:last-child { border-right: none; }
        .addr-field.full { grid-column: 1/-1; border-right: none; }
        .addr-field:focus-within { background: rgba(201,169,110,0.02); }
        .addr-label {
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--text-dimmer); display: block; margin-bottom: 0.6rem;
          transition: color 0.3s;
        }
        .addr-field:focus-within .addr-label { color: var(--gold); }
        .addr-input {
          width: 100%; background: none;
          border: 1px solid rgba(245,240,232,0.07); outline: none;
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 300;
          padding: 0.8rem 0.9rem;
          transition: border-color 0.3s; box-sizing: border-box;
        }
        .addr-input::placeholder { color: var(--text-dimmer); opacity: 0.45; }
        .addr-input:focus { border-color: rgba(201,169,110,0.4); }
        .addr-actions {
          display: flex; gap: 1rem; padding: 2rem;
          border-top: 1px solid var(--border);
        }
        .btn-back {
          background: none; border: 1px solid var(--border); color: var(--text-dim);
          padding: 0.9rem 1.8rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: border-color 0.3s, color 0.3s;
        }
        .btn-back:hover { border-color: var(--gold); color: var(--gold); }
        .btn-place {
          flex: 1; background: var(--gold); color: var(--ink); border: none;
          padding: 1rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase;
          font-weight: 500; cursor: pointer;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .btn-place:hover:not(:disabled) { background: var(--gold-hover); box-shadow: 0 8px 30px rgba(201,169,110,0.25); }
        .btn-place:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ORDER CONFIRMATION */
        .order-confirm {
          grid-column: 1/-1;
          text-align: center;
          padding: 5rem 4rem;
          border: 1px solid rgba(201,169,110,0.3);
          background: rgba(201,169,110,0.02);
          position: relative; overflow: hidden;
          animation: fadeUp 0.8s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        .order-confirm::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .confirm-icon { font-size: 3.5rem; display: block; margin-bottom: 1.5rem; }
        .confirm-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 300;
          margin-bottom: 0.8rem; line-height: 1.1;
        }
        .confirm-title em { font-style: italic; color: var(--gold); }
        .confirm-desc {
          font-size: 0.95rem; color: var(--text-dim);
          margin-bottom: 1rem; line-height: 1.8; max-width: 500px; margin-inline: auto;
        }
        .confirm-id {
          font-family: monospace; font-size: 0.85rem; letter-spacing: 0.2em;
          color: var(--gold); background: rgba(201,169,110,0.08);
          border: 1px dashed rgba(201,169,110,0.3);
          display: inline-block; padding: 0.5rem 1.2rem;
          margin: 1.5rem 0 3rem;
        }
        .confirm-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary-link {
          background: var(--gold); color: var(--ink); text-decoration: none;
          padding: 1rem 2.5rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.16em;
          text-transform: uppercase; font-weight: 500;
          transition: background 0.3s; display: inline-block;
        }
        .btn-primary-link:hover { background: var(--gold-hover); }
        .btn-outline-link {
          background: none; color: var(--text-dim);
          border: 1px solid var(--border); text-decoration: none;
          padding: 1rem 2.5rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.16em;
          text-transform: uppercase; transition: border-color 0.3s, color 0.3s;
          display: inline-block;
        }
        .btn-outline-link:hover { border-color: var(--gold); color: var(--gold); }

        @media (max-width: 1000px) {
          .cart-grid { grid-template-columns: 1fr; }
          .order-summary { position: static; }
        }
        @media (max-width: 700px) {
          .cart-page { padding: 5rem 2rem 6rem; }
          .cart-item { grid-template-columns: 80px 1fr; gap: 1rem; }
          .cart-item-actions { grid-column: 1/-1; flex-direction: row; justify-content: space-between; }
          .addr-row { grid-template-columns: 1fr; }
          .addr-field { border-right: none; border-bottom: 1px solid var(--border); }
        }
      `}</style>

      <div className="cart-page">
        {/* HEADER */}
        <div className="cart-header">
          <div className="cart-eyebrow">
            <span className="cart-eyebrow-line"></span>
            Your Selection
          </div>
          <h1>
            {checkoutStep === 'confirm' ? <>Order <em>Confirmed</em></> :
             checkoutStep === 'address' ? <>Delivery <em>Details</em></> :
             <>Your <em>Cart</em></>}
          </h1>
          {checkoutStep !== 'confirm' && (
            <div className="checkout-steps">
              <div className={`step ${checkoutStep === 'cart' ? 'active' : 'done'}`}>
                <span className="step-num">{checkoutStep === 'cart' ? '1' : '✓'}</span>
                Cart
              </div>
              <div className="step-line"></div>
              <div className={`step ${checkoutStep === 'address' ? 'active' : checkoutStep === 'confirm' ? 'done' : ''}`}>
                <span className="step-num">2</span>
                Delivery
              </div>
              <div className="step-line"></div>
              <div className={`step ${checkoutStep === 'confirm' ? 'active' : ''}`}>
                <span className="step-num">3</span>
                Confirm
              </div>
            </div>
          )}
        </div>

        {/* CONFIRM */}
        {checkoutStep === 'confirm' && (
          <div className="cart-grid">
            <div className="order-confirm">
              <span className="confirm-icon">🎉</span>
              <h2 className="confirm-title">Thank you for your<br /><em>Order!</em></h2>
              <p className="confirm-desc">Your wellness delivery is confirmed. You'll receive an email with tracking details shortly.</p>
              <div className="confirm-id">#ORD-{orderId.slice(-6).toUpperCase()}</div>
              <div className="confirm-actions">
                <Link to="/products" className="btn-primary-link">Continue Shopping</Link>
                <Link to="/profile" className="btn-outline-link">View Orders</Link>
              </div>
            </div>
          </div>
        )}

        {/* CART + ADDRESS */}
        {checkoutStep !== 'confirm' && (
          <div className="cart-grid">
            <div>
              {/* CART STEP */}
              {checkoutStep === 'cart' && (
                cart.length === 0 ? (
                  <div className="cart-empty">
                    <span className="empty-icon">🧘</span>
                    <div className="empty-title">Your cart is empty</div>
                    <p className="empty-desc">Explore our collection and find your perfect wellness blend.</p>
                    <Link to="/products" className="btn-shop">Shop Now</Link>
                  </div>
                ) : (
                  <div className="cart-items">
                    {/* Empty Cart Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <button className="btn-clear-cart" onClick={handleEmptyCart}>
                        Empty Cart
                      </button>
                    </div>
                    {cart.map((item, idx) => (
                      <div className="cart-item" key={item.id || `${item.name}-${idx}`}>
                        
                        {/* ── BTO IMAGE RENDERING ── */}
                        <div className="cart-item-img">
                          {item.isBTO ? (
                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem'}}>
                              {item.image || '🧪'}
                            </div>
                          ) : (
                            <img src={item.img || item.image} alt={item.name} loading="lazy" />
                          )}
                        </div>
                        
                        <div className="cart-item-info">
                          {/* ── BTO TAG RENDERING ── */}
                          {item.isBTO ? (
                            <span className="cart-item-tag bto-tag">Custom Lab Order</span>
                          ) : (
                            <span className="cart-item-tag">{item.tag}</span>
                          )}
                          
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">₹{(item.price * getQty(item)).toLocaleString('en-IN')}</div>
                          
                          {/* ── BTO RECIPE RENDERING ── */}
                          {item.isBTO && item.recipe && (
                            <div className="bto-recipe-details">
                              <div>Vol: <span>{item.volume}</span></div>
                              <div>Mix: <span>{item.recipe.join(', ')}</span></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="cart-item-actions">
                          <div className="qty-control">
                            <button className="qty-btn" onClick={() => updateQty(item.name, -1)}>−</button>
                            <span className="qty-num">{getQty(item)}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(item.name, 1)}
                              disabled={!item.isBTO && getQty(item) >= (item.stockQuantity || 10)}
                            >+</button>
                          </div>
                          <button className="remove-btn" onClick={() => removeItem(item.name)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ADDRESS STEP */}
              {checkoutStep === 'address' && (
                <div className="address-form">
                  <div className="addr-row">
                    <div className="addr-field">
                      <label className="addr-label">Full Name</label>
                      <input className="addr-input" type="text" placeholder="Your full name"
                        value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                    </div>
                    <div className="addr-field">
                      <label className="addr-label">Phone Number</label>
                      <input className="addr-input" type="tel" placeholder="+91 98765 43210"
                        value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="addr-row">
                    <div className="addr-field full">
                      <label className="addr-label">Address Line</label>
                      <input className="addr-input" type="text" placeholder="Flat / Building, Street, Area"
                        value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} />
                    </div>
                  </div>
                  <div className="addr-row">
                    <div className="addr-field">
                      <label className="addr-label">City</label>
                      <input className="addr-input" type="text" placeholder="Mumbai"
                        value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                    </div>
                    <div className="addr-field">
                      <label className="addr-label">PIN Code</label>
                      <input className="addr-input" type="text" placeholder="400001"
                        value={address.pin} onChange={e => setAddress({...address, pin: e.target.value})} />
                    </div>
                  </div>
                  <div className="addr-actions">
                    <button className="btn-back" onClick={() => setCheckoutStep('cart')}>← Back</button>
                    <button
                      className="btn-place"
                      onClick={handlePlaceOrder}
                      disabled={placingOrder || !address.name || !address.line1 || !address.city || !address.pin}
                    >
                      {placingOrder ? 'Connecting to Payment...' : 'Place Order →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY SIDEBAR */}
            {cart.length > 0 && (
              <div className="order-summary">
                <div className="summary-head">
                  <span className="summary-label">Breakdown</span>
                  <h3 className="summary-title">Order <em>Summary</em></h3>
                </div>
                <div className="summary-body">
                  {cart.map((item, idx) => (
                    <div className="summary-row" key={item.id || `${item.name}-${idx}`}>
                      <span className="s-label">{item.name} × {getQty(item)}</span>
                      <span className="s-val">₹{(item.price * getQty(item)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  
                  <div className="summary-row" style={{ marginTop: '1rem', borderTop: '1px solid rgba(245,240,232,0.05)', paddingTop: '1rem' }}>
                    <span className="s-label">Subtotal</span>
                    <span className="s-val">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {promoApplied && (
                    <div className="summary-row">
                      <span className="s-label">Promo (SIP15)</span>
                      <span className="s-val green">−₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* ── REAL-WORLD TAX ROW ── */}
                  <div className="summary-row">
                    <span className="s-label">Estimated Tax (18% GST)</span>
                    <span className="s-val">₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="summary-row">
                    <span className="s-label">Shipping & Handling</span>
                    {shipping === 0
                      ? <span className="s-val free">Free</span>
                      : <span className="s-val">₹{shipping}</span>}
                  </div>
                  
                  <div className="summary-row total">
                    <span className="s-label">Total Amount</span>
                    <span className="s-val">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* ── ECO IMPACT WIDGET ── */}
                <div className="eco-impact-widget">
                  <div className="eco-icon">🍃</div>
                  <div className="eco-text">
                    <h4>Sustainability Impact</h4>
                    <p>By choosing OneSip, you have offset <strong>{ecoImpact}g of CO2</strong> emissions today.</p>
                  </div>
                </div>

                {/* Promo Code */}
                {!promoApplied && checkoutStep === 'cart' && (
                  <div className="promo-wrap">
                    <input
                      className="promo-input"
                      type="text"
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                    />
                    <button className="promo-btn" onClick={handlePromo}>Apply</button>
                  </div>
                )}
                {promoApplied && <div className="promo-success">✓ SIP15 applied — 15% off!</div>}
                {promoError && <div className="promo-error">{promoError}</div>}

                <div className="summary-cta">
                  {checkoutStep === 'cart' && (
                    <button
                      className="btn-checkout"
                      onClick={() => {
                        if (!currentUser) navigate('/login?redirect=/cart');
                        else setCheckoutStep('address');
                      }}
                    >
                      Proceed to Checkout →
                    </button>
                  )}
                  <p className="summary-note">
                    {shipping > 0 ? `Add ₹${(499 - taxableAmount).toLocaleString('en-IN')} more for free shipping` : '✓ Free shipping unlocked'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}