import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;;

export default function AISommelier() {
  const { currentUser } = useAuth();
  const { cart } = useCart();
  const chatEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const greeting = currentUser?.displayName
    ? `Hello, ${currentUser.displayName}. I'm your personal OneSip wellness coach. How are you feeling today — and what's your goal right now?`
    : "Hello! I'm your OneSip AI Wellness Coach. Tell me how you're feeling and I'll suggest the perfect drink for you.";

  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: greeting }
  ]);

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isOpen]);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: query }];
    setChatHistory(newHistory);
    setQuery('');
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const userName = currentUser?.displayName || "a valued customer";
      const cartItems = cart.length > 0 ? cart.map(i => i.name).join(", ") : "nothing yet";
      const prompt = `You are an expert E-Business CRM Specialist & Wellness Coach for "OneSip", a premium beverage brand.
      Customer: ${userName}. Cart: ${cartItems}.
      Products: Organic Green Tea, Protein Power Shake, Cold Pressed Detox Juice, Premium Black Coffee, Coconut Water, Kombucha Ginger, Ashwagandha Latte, Matcha Cold Brew, Turmeric Golden Milk, Electrolyte Sports Drink.
      Based on their mood or goal, suggest 1 specific drink with a clear wellness benefit. Be warm, expert, and concise. Max 3 sentences. Mention code "ZEN10".
      Customer says: "${query}"`;
      const result = await model.generateContent(prompt);
      setChatHistory([...newHistory, { role: 'model', text: result.response.text() }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: 'model', text: "My wellness sensors are recalibrating — try our Organic Green Tea in the meantime. Use code ZEN10 for a discount." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "I need more energy",
    "Help me detox",
    "Post-workout recovery",
    "Feeling stressed",
  ];

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════
           AI SOMMELIER — PREMIUM FLOATING CHAT
        ═══════════════════════════════════════════════ */

        .sommelier-btn {
          position: fixed;
          bottom: 2rem; right: 2rem;
          width: 58px; height: 58px;
          border-radius: 50%;
          background: var(--gold, #c9a96e);
          color: #0d0d0a;
          border: none;
          box-shadow: 0 8px 30px rgba(201,169,110,0.4), 0 0 0 1px rgba(201,169,110,0.2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s;
        }
        .sommelier-btn:hover {
          transform: translateY(-4px) scale(1.06);
          box-shadow: 0 16px 50px rgba(201,169,110,0.5), 0 0 0 1px rgba(201,169,110,0.3);
        }
        .sommelier-btn::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(201,169,110,0.25);
          animation: ringPulse 2.5s ease-in-out infinite;
        }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.15);opacity:0} }

        /* CHAT WINDOW */
        .sommelier-window {
          position: fixed;
          bottom: 7rem; right: 2rem;
          width: 380px;
          max-height: 560px;
          background: #0e0e0b;
          border: 1px solid rgba(201,169,110,0.25);
          border-radius: 0;
          display: flex; flex-direction: column;
          z-index: 999;
          box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.1);
          overflow: hidden;
          transform: translateY(16px) scale(0.97);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.45s cubic-bezier(0.23,1,0.32,1), opacity 0.35s, scale 0.45s;
          transform-origin: bottom right;
        }
        .sommelier-window.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          pointer-events: all;
        }
        .sommelier-window::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, var(--gold, #c9a96e), transparent);
          z-index: 1;
        }

        /* HEADER */
        .chat-header {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid rgba(201,169,110,0.12);
          display: flex; align-items: center;
          justify-content: space-between;
          background: rgba(201,169,110,0.04);
          flex-shrink: 0;
        }
        .chat-header-info { display: flex; align-items: center; gap: 0.9rem; }
        .chat-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(201,169,110,0.12);
          border: 1px solid rgba(201,169,110,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; color: #c9a96e;
          flex-shrink: 0;
          position: relative;
        }
        .chat-avatar::after {
          content: '';
          position: absolute; bottom: 1px; right: 1px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #7a8c6e;
          border: 1.5px solid #0e0e0b;
        }
        .chat-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 400; color: #f5f0e8;
          line-height: 1; margin: 0;
        }
        .chat-title em { font-style: italic; color: #c9a96e; }
        .chat-subtitle {
          font-size: 0.65rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(245,240,232,0.3);
          margin-top: 0.2rem;
        }
        .chat-close {
          background: none; border: none;
          color: rgba(245,240,232,0.3); cursor: pointer;
          transition: color 0.3s; padding: 0.2rem;
          display: flex; align-items: center;
        }
        .chat-close:hover { color: rgba(245,240,232,0.8); }

        /* MESSAGES */
        .chat-messages {
          flex: 1; overflow-y: auto;
          padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(201,169,110,0.15) transparent;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.15); border-radius: 2px; }

        .msg {
          padding: 0.9rem 1.1rem;
          font-size: 0.87rem; line-height: 1.6;
          max-width: 88%; border-radius: 0;
          animation: msgIn 0.3s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .msg.user {
          background: rgba(245,240,232,0.07);
          color: rgba(245,240,232,0.85);
          align-self: flex-end;
          border-bottom-right-radius: 0;
          border: 1px solid rgba(245,240,232,0.06);
        }
        .msg.model {
          background: rgba(201,169,110,0.08);
          border: 1px solid rgba(201,169,110,0.18);
          color: rgba(245,240,232,0.85);
          align-self: flex-start;
          border-bottom-left-radius: 0;
        }

        .typing {
          display: flex; gap: 5px; padding: 1rem 1.2rem;
          align-self: flex-start;
          background: rgba(201,169,110,0.06);
          border: 1px solid rgba(201,169,110,0.15);
        }
        .t-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(201,169,110,0.6);
          animation: tdot 1.3s ease-in-out infinite;
        }
        .t-dot:nth-child(2) { animation-delay: 0.18s; }
        .t-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes tdot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

        /* QUICK PROMPTS */
        .quick-prompts {
          padding: 0.8rem 1.2rem;
          border-top: 1px solid rgba(201,169,110,0.08);
          display: flex; gap: 0.5rem; flex-wrap: wrap;
          flex-shrink: 0;
          background: rgba(13,13,10,0.4);
        }
        .quick-btn {
          background: rgba(201,169,110,0.06);
          border: 1px solid rgba(201,169,110,0.15);
          color: rgba(245,240,232,0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem; letter-spacing: 0.08em;
          padding: 0.35rem 0.75rem;
          cursor: pointer;
          transition: background 0.3s, color 0.3s, border-color 0.3s;
          white-space: nowrap;
        }
        .quick-btn:hover { background: rgba(201,169,110,0.12); color: #c9a96e; border-color: rgba(201,169,110,0.3); }

        /* INPUT */
        .chat-input-area {
          padding: 1rem 1.2rem;
          border-top: 1px solid rgba(201,169,110,0.12);
          display: flex; gap: 0.7rem; align-items: center;
          background: rgba(13,13,10,0.6);
          flex-shrink: 0;
          transition: border-top-color 0.3s;
        }
        .chat-input-area.focused { border-top-color: rgba(201,169,110,0.3); }
        .chat-input {
          flex: 1; background: transparent; border: none;
          color: rgba(245,240,232,0.8); outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 300;
        }
        .chat-input::placeholder { color: rgba(245,240,232,0.2); }
        .send-btn {
          background: none; border: none;
          color: rgba(201,169,110,0.4);
          cursor: pointer; padding: 0.3rem;
          transition: color 0.3s, transform 0.2s;
          display: flex; align-items: center;
        }
        .send-btn:hover:not(:disabled) { color: #c9a96e; transform: translateX(2px); }
        .send-btn:disabled { opacity: 0.25; cursor: not-allowed; }

        @media (max-width: 480px) {
          .sommelier-window { right: 1rem; left: 1rem; width: auto; }
        }
      `}</style>

      {/* TRIGGER BUTTON */}
      <button className="sommelier-btn" onClick={() => setIsOpen(!isOpen)} aria-label="AI Wellness Coach">
        {isOpen
          ? <CloseIcon style={{ fontSize: '1.6rem' }} />
          : <SmartToyIcon style={{ fontSize: '1.8rem' }} />}
      </button>

      {/* CHAT WINDOW */}
      <div className={`sommelier-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <SmartToyIcon style={{ fontSize: '1.1rem' }} />
            </div>
            <div>
              <h3 className="chat-title">OneSip <em>AI Coach</em></h3>
              <div className="chat-subtitle">Online · Wellness Expert</div>
            </div>
          </div>
          <button className="chat-close" onClick={() => setIsOpen(false)}>
            <CloseIcon style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ))}
          {isLoading && (
            <div className="typing">
              <div className="t-dot"></div>
              <div className="t-dot"></div>
              <div className="t-dot"></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        {chatHistory.length <= 2 && (
          <div className="quick-prompts">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                className="quick-btn"
                onClick={() => {
                  setQuery(p);
                  setTimeout(() => {
                    const fakeEvent = { preventDefault: () => {} };
                    setQuery(p);
                  }, 0);
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          className={`chat-input-area ${inputFocused ? 'focused' : ''}`}
          onSubmit={handleAskAI}
        >
          <input
            type="text"
            className="chat-input"
            placeholder="Tell me how you feel…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !query.trim()}>
            <SendIcon style={{ fontSize: '1.2rem' }} />
          </button>
        </form>
      </div>
    </>
  );
}