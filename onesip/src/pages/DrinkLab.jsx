import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config'; 
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom';

export default function DrinkLab() {
  const { currentUser } = useAuth();
  const { addToCart } = useCart(); 
  const navigate = useNavigate();
  
  // ─── STATE MANAGEMENT ───
  const [drinkName, setDrinkName] = useState('');
  const [selectedMix, setSelectedMix] = useState([]);
  const [volume, setVolume] = useState(500); 
  const [ingredients, setIngredients] = useState([]); 
  const [loading, setLoading] = useState(true); 

  // ─── MASTER CONFIGURATION ───
  const volumeOptions = [
    { label: '50ml Shot', value: 50, basePrice: 49, multiplier: 0.3 },
    { label: '75ml Booster', value: 75, basePrice: 59, multiplier: 0.4 },
    { label: '100ml Power', value: 100, basePrice: 69, multiplier: 0.5 },
    { label: '250ml Personal', value: 250, basePrice: 89, multiplier: 0.7 },
    { label: '500ml Standard', value: 500, basePrice: 129, multiplier: 1.0 },
    { label: '750ml Premium', value: 750, basePrice: 179, multiplier: 1.4 },
    { label: '1L Family', value: 1000, basePrice: 229, multiplier: 1.8 },
  ];

  // ─── FETCH DYNAMIC INVENTORY (LIVE SCM) ───
  const fetchInventory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'lab_inventory'));
      const inventoryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIngredients(inventoryData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ─── PRICING CALCULATIONS ───
  const currentVolObj = volumeOptions.find(v => v.value === volume);
  const multiplier = currentVolObj.multiplier;
  const basePrice = currentVolObj.basePrice;

  const ingredientsTotal = selectedMix.reduce((acc, curr) => acc + (curr.price * multiplier), 0);
  const totalPrice = Math.round(basePrice + ingredientsTotal);

  // ─── INTERACTION HANDLERS ───
  const toggleIngredient = (ing) => {
    if (ing.stock <= 0) return; 
    
    if (selectedMix.find(i => i.id === ing.id)) {
      setSelectedMix(selectedMix.filter(i => i.id !== ing.id));
    } else {
      if (selectedMix.length >= 4) return alert("Maximum 4 ingredients for a balanced mix!");
      setSelectedMix([...selectedMix, ing]);
    }
  };

  // ─── CART INTEGRATION ───
  const handleAddToCart = () => {
    if (!currentUser) return alert("Please login to initiate a custom pull request.");
    if (!drinkName.trim()) return alert("Please enter a Creation Name before initiating production!");
    if (selectedMix.length === 0) return alert("Please select at least one active ingredient!");
    
    const customDrinkItem = {
      id: `bto_${Date.now()}`, 
      name: `Signature: ${drinkName.trim()}`,
      price: totalPrice,
      quantity: 1,
      image: '🧪', 
      isBTO: true, 
      volume: `${volume}ml`,
      recipe: selectedMix.map(i => i.name) 
    };

    addToCart(customDrinkItem);
    alert(`Success! "${drinkName}" has been pushed to your cart for final checkout.`);
    navigate('/cart'); 
  };

  // ─── FULL 12-ITEM DATABASE SEED FUNCTION ───
  const seedDatabase = async () => {
    const initialData = [
      { id: 'apple', name: 'Organic Apple', price: 40, stock: 50, icon: '🍎' },
      { id: 'orange', name: 'Fresh Orange', price: 35, stock: 45, icon: '🍊' },
      { id: 'pomegranate', name: 'Ruby Pom', price: 65, stock: 15, icon: '🍒' },
      { id: 'kiwi', name: 'Zesty Kiwi', price: 45, stock: 30, icon: '🥝' },
      { id: 'watermelon', name: 'Summer Melon', price: 30, stock: 10, icon: '🍉' },
      { id: 'berry', name: 'Wild Berries', price: 60, stock: 0, icon: '🫐' }, 
      { id: 'dragon', name: 'Dragon Fruit', price: 80, stock: 12, icon: '🌵' },
      { id: 'kale', name: 'Super Kale', price: 45, stock: 15, icon: '🥬' },
      { id: 'spinach', name: 'Power Spinach', price: 35, stock: 40, icon: '🥗' },
      { id: 'ginger', name: 'Zesty Ginger', price: 25, stock: 100, icon: '🫚' },
      { id: 'turmeric', name: 'Golden Root', price: 30, stock: 25, icon: '🟡' },
      { id: 'mint', name: 'Cool Mint', price: 15, stock: 80, icon: '🌿' },
    ];
    
    setLoading(true);
    try {
      for (const item of initialData) {
        // setDoc will completely overwrite any old data and push all 12
        await setDoc(doc(db, 'lab_inventory', item.id), item);
      }
      alert("All 12 items synced to Firebase successfully!");
      fetchInventory(); // Reload the data instantly
    } catch (error) {
      console.error(error);
      alert("Database error. Check Firebase permissions.");
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding: '10rem', textAlign: 'center', color: 'var(--gold)', fontSize: '1.2rem', letterSpacing: '0.1em', textTransform: 'uppercase'}}>Syncing Live Cloud Inventory...</div>;

  return (
    <main className="lab-page">
      <style>{`
        /* REFACTORED CSS FOR PERFECT FORMATTING */
        .lab-page { padding: 6rem 4rem; max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 4rem; min-height: 100vh; align-items: start; }
        .section-label { color: var(--gold); letter-spacing: 0.25em; text-transform: uppercase; font-size: 0.75rem; display: block; margin-bottom: 1.5rem; border-left: 2px solid var(--gold); padding-left: 12px; font-weight: 600;}
        
        /* Volume Selector */
        .vol-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.8rem; margin-bottom: 4rem; }
        .vol-card { padding: 1.5rem 0.5rem; border: 1px solid var(--border); background: var(--glass); cursor: pointer; text-align: center; transition: all 0.3s ease; border-radius: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 90px; }
        .vol-card.active { border-color: var(--gold); background: rgba(201,169,110,0.12); color: var(--gold); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(201,169,110,0.15); }
        .vol-card strong { font-size: 0.95rem; display: block; margin-bottom: 4px;}
        .vol-card small { font-size: 0.7rem; opacity: 0.6; }

        /* Ingredients Grid */
        .ing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1.2rem; }
        .ing-item { padding: 2rem 1rem; border: 1px solid var(--border); background: var(--card-bg); cursor: pointer; text-align: center; transition: 0.3s ease; position: relative; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 160px; }
        .ing-item:hover { border-color: var(--gold); transform: translateY(-2px); }
        .ing-item.selected { border-color: var(--gold); background: var(--card-hover); border-width: 2px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); transform: translateY(-2px); }
        .ing-item.out-of-stock { opacity: 0.25; cursor: not-allowed; filter: grayscale(1); transform: none; }
        .ing-item.out-of-stock:hover { border-color: var(--border); transform: none; }
        .ing-icon { font-size: 2.8rem; display: block; margin-bottom: 1rem; transition: transform 0.3s ease; }
        .ing-item.selected .ing-icon { transform: scale(1.15); }
        .ing-name { font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; color: var(--cream); font-weight: 500; line-height: 1.2; margin-bottom: 0.5rem; }
        .ing-price { font-size: 0.8rem; color: var(--gold); font-weight: 600; margin: 0; }
        .stock-badge { position: absolute; top: 12px; right: 12px; font-size: 0.5rem; color: #ff6b6b; font-weight: bold; text-transform: uppercase; border: 1px solid #ff6b6b; padding: 3px 6px; border-radius: 3px; }

        /* Sidebar Pane */
        .preview-pane { border: 1px solid var(--gold); padding: 3.5rem 2.5rem; background: var(--card-bg); position: sticky; top: 100px; border-radius: 6px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .name-input { width: 100%; background: none; border: none; border-bottom: 1px solid var(--border); color: var(--cream); font-size: 1.8rem; font-family: 'Cormorant Garamond', serif; margin-bottom: 2.5rem; outline: none; transition: border-color 0.3s; padding: 0.5rem 0; }
        .name-input:focus { border-color: var(--gold); }
        .recipe-list { margin-bottom: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 2rem; min-height: 120px; }
        .recipe-item { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 1rem; letter-spacing: 0.05em; align-items: center; }
        .total-section { text-align: center; }
        .total-price { font-size: 4.5rem; color: var(--gold); font-family: 'Cormorant Garamond', serif; display: block; margin: 0.5rem 0 2rem 0; font-weight: 400; line-height: 1; }
        
        .btn-production { background: var(--gold); color: var(--ink); border: none; width: 100%; padding: 1.3rem; font-size: 0.85rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 700; cursor: pointer; transition: all 0.3s ease; border-radius: 4px; }
        .btn-production:hover:not(:disabled) { background: var(--gold-hover); transform: scale(1.02); }
        .btn-production:disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }

        /* Force Sync Button Styling */
        .force-sync-btn { margin-top: 3rem; background: none; border: 1px dashed #ff6b6b; color: #ff6b6b; width: 100%; padding: 1rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: 0.3s; border-radius: 4px; }
        .force-sync-btn:hover { background: rgba(255, 107, 107, 0.1); }

        @media (max-width: 1024px) {
          .lab-page { grid-template-columns: 1fr; padding: 4rem 2rem; }
          .preview-pane { position: static; margin-top: 2rem; }
          .vol-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <section>
        <div style={{marginBottom: '4rem'}}>
          <span className="section-label">Inventory Pull Protocol</span>
          <h1 style={{fontSize: '3.5rem', marginBottom: '1rem', fontFamily: 'Cormorant Garamond', fontWeight: 300, color: 'var(--cream)'}}>
            <em>Signature</em> Lab
          </h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: '550px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Shift from mass production to personal curation. Select your bottle volume and bioactive ingredients. Our lab initializes production only upon your unique "Pull" request.
          </p>
        </div>

        <div>
          <span className="section-label">I. Select Volume Tier</span>
          <div className="vol-grid">
            {volumeOptions.map(v => (
              <div key={v.value} className={`vol-card ${volume === v.value ? 'active' : ''}`} onClick={() => setVolume(v.value)}>
                <strong>{v.label}</strong>
                <small>Base ₹{v.basePrice}</small>
              </div>
            ))}
          </div>

          <span className="section-label">II. Active Ingredients (Live SCM Data)</span>
          <div className="ing-grid">
            {ingredients.map(ing => (
              <div 
                key={ing.id} 
                className={`ing-item ${selectedMix.find(i => i.id === ing.id) ? 'selected' : ''} ${ing.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => toggleIngredient(ing)}
              >
                {ing.stock <= 0 && <span className="stock-badge">Sold Out</span>}
                <span className="ing-icon">{ing.icon}</span>
                <span className="ing-name">{ing.name}</span>
                <p className="ing-price">+ ₹{Math.round(ing.price * multiplier)}</p>
              </div>
            ))}
          </div>
          
          {/* SAFETY NET: If Firebase has less than 12 items, show the button to fix it */}
          {ingredients.length < 12 && (
            <button onClick={seedDatabase} className="force-sync-btn">
              [SYSTEM WARNING] Missing Inventory Detected. Click to Force-Sync all 12 Items.
            </button>
          )}
        </div>
      </section>

      <aside className="preview-pane">
        <input 
          type="text"
          className="name-input"
          placeholder="Creation Name..." 
          value={drinkName} 
          onChange={(e) => setDrinkName(e.target.value)}
          autoComplete="off"
        />
        
        <div className="recipe-list">
          <div className="recipe-item">
            <span>Glassware & Sterilization</span>
            <span>₹{basePrice}</span>
          </div>
          {selectedMix.map(i => (
            <div className="recipe-item" key={i.id}>
              <span>{i.name} <span style={{opacity: 0.5, fontSize: '0.75rem'}}>({multiplier.toFixed(1)}x)</span></span>
              <span>₹{Math.round(i.price * multiplier)}</span>
            </div>
          ))}
          {selectedMix.length === 0 && (
            <p style={{fontSize: '0.8rem', textAlign: 'center', opacity: 0.4, margin: '2rem 0', fontStyle: 'italic'}}>
              Waiting for active ingredients...
            </p>
          )}
        </div>

        <div className="total-section">
          <span className="section-label" style={{border: 'none', padding: 0, textAlign: 'center', marginBottom: '0.5rem'}}>Net Pull Value</span>
          <span className="total-price">₹{totalPrice}</span>
          <button 
            className="btn-production" 
            onClick={handleAddToCart}
            disabled={ingredients.length === 0}
          >
            Push to Cart
          </button>
        </div>
      </aside>
    </main>
  );
}