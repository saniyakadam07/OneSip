import React, { useEffect } from 'react';

export default function About() {
  // ── ALL ORIGINAL LOGIC PRESERVED ──
  useEffect(() => {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  useEffect(() => {
    function countUp(el, target, duration = 1600) {
      let start = 0;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + '%';
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    const surveyObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.classList.contains('counted')) {
          e.target.classList.add('counted');
          const pctEl = e.target.querySelector('.survey-pct');
          if (pctEl) countUp(pctEl, parseInt(pctEl.dataset.target));
        }
      });
    }, { threshold: 0.3 });
    const surveyCards = document.querySelectorAll('.survey-card');
    surveyCards.forEach((c) => surveyObs.observe(c));
    return () => surveyObs.disconnect();
  }, []);

  const pillars = [
    { n:'01', icon:'🍹', t:'Beverage-Only Marketplace', p:'Unlike generic grocery apps, OneSip specializes exclusively in beverages — giving you a curated, premium hydration experience with zero noise.' },
    { n:'02', icon:'🥗', t:'Health-Based Filters', p:'Filter by sugar-free, protein-rich, vegan, detox, or wellness categories. Make smarter drink choices without the research.' },
    { n:'03', icon:'🤖', t:'Personalized Recommendations', p:'Our smart engine suggests products based on your purchase behavior, health goals, and preferences. It learns, so you don\'t have to.' },
    { n:'04', icon:'🔁', t:'Subscription Hydration Plans', p:'Automated monthly delivery for uninterrupted hydration. Save up to 15% and never run dry again.' },
    { n:'05', icon:'📊', t:'Transparent Nutrition Insights', p:'View full ingredient lists, calorie content, and sugar levels before you buy. Radical transparency, always.' },
  ];

  const surveyData = [
    { target: 65, label: 'Prefer health-filtered browsing when choosing beverages' },
    { target: 70, label: 'Want subscription delivery options for regular purchases' },
    { target: 58, label: 'Actively seek and demand sugar-free beverages' },
    { target: 60, label: 'Prefer full nutritional transparency before purchasing' },
    { target: 55, label: 'Would choose a beverage-only marketplace over generics' },
  ];

  return (
    <>
      <style>{`
        /* ── HERO ── */
        .about-hero {
          min-height: calc(100vh - 80px);
          display: flex; align-items: center;
          position: relative; overflow: hidden;
          padding: 6rem 4rem 6rem;
        }
        .about-hero::before {
          content: 'W';
          position: absolute;
          font-family: 'Cormorant Garamond', serif;
          font-size: 55vw; font-weight: 300;
          color: var(--deco-letter, rgba(201,169,110,0.03));
          line-height: 1; top: -10%; right: -5%;
          pointer-events: none; user-select: none; transition: color 0.4s;
        }
        .about-hero::after {
          content: '';
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, var(--orb-col, rgba(122,140,110,0.15)) 0%, transparent 70%);
          bottom: -10%; right: 10%;
          animation: drift 14s ease-in-out infinite alternate; pointer-events: none;
        }
        @keyframes drift { from{transform:translate(0,0)} to{transform:translate(30px,25px)} }

        .hero-inner {
          max-width: 1300px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 6rem; align-items: center;
          position: relative; z-index: 1;
        }
        .hero-text { animation: fadeUp 1.1s cubic-bezier(0.23,1,0.32,1) forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(35px)} to{opacity:1;transform:translateY(0)} }

        .eyebrow { font-size:0.74rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--sage); display:block; margin-bottom:1.2rem; }
        .about-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(3.8rem,6.5vw,6.5rem); font-weight:300; line-height:1.05; margin-bottom:1.5rem; }
        .about-hero h1 em { font-style:italic; color:var(--gold); }
        .about-hero .hero-text p { font-size:1.05rem; line-height:1.9; color:var(--text-dim); max-width:440px; }

        .hero-manifesto { border-left:1px solid var(--border); padding-left:3rem; animation:fadeUp 1.1s 0.3s cubic-bezier(0.23,1,0.32,1) both; }
        .manifesto-quote { font-family:'Cormorant Garamond',serif; font-size:clamp(1.7rem,2.5vw,2.5rem); font-weight:300; font-style:italic; line-height:1.5; color:var(--text-dim); margin-bottom:2.5rem; }
        .manifesto-quote strong { color:var(--cream); font-style:normal; font-weight:400; }
        .manifesto-meta { font-size:0.74rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dimmer); }

        /* ── SHOWCASE STRIP ── */
        .showcase-strip {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 1px;
          background: var(--border); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          max-width: 100%;
        }
        .showcase-cell { position: relative; overflow: hidden; height: 340px; }
        .showcase-cell img { width:100%; height:100%; object-fit:cover; filter:saturate(0.55) brightness(0.7); transition:transform 0.8s cubic-bezier(0.23,1,0.32,1),filter 0.6s; }
        .showcase-cell:hover img { transform:scale(1.06); filter:saturate(0.8) brightness(0.8); }
        .showcase-cell-label {
          position:absolute; bottom:2rem; left:2rem; right:2rem;
          font-family:'Cormorant Garamond',serif; font-size:1.3rem; font-style:italic; font-weight:300;
          color:rgba(245,240,232,0.85);
          pointer-events:none;
        }
        .showcase-cell-label span { display:block; font-family:'DM Sans',sans-serif; font-style:normal; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem; }

        /* ── SHARED LABELS ── */
        .section-label { font-size:0.74rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--sage); display:block; margin-bottom:1rem; }
        .section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,4.5vw,4.2rem); font-weight:300; line-height:1.1; }
        .section-title em { font-style:italic; color:var(--gold); }

        /* ── PILLARS ── */
        .pillars-section { padding:8rem 4rem; }
        .pillars-inner { max-width:1300px; margin:0 auto; }
        .features-header { margin-bottom:5rem; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:end; border-bottom:1px solid var(--border); padding-bottom:3rem; }
        .features-desc { color:var(--text-dim); line-height:1.9; font-size:1rem; max-width:400px; margin-left:auto; }

        .feature-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); }
        .feature-card:last-child:nth-child(3n - 1) { grid-column:span 2; }
        .feature-card { background:var(--card-bg); padding:3.5rem 3rem; position:relative; overflow:hidden; transition:background 0.4s; }
        .feature-card::after { content:''; position:absolute; left:0; bottom:0; right:0; height:2px; background:linear-gradient(to right,transparent,var(--gold),transparent); transform:scaleX(0); transform-origin:center; transition:transform 0.5s; }
        .feature-card:hover { background:var(--card-hover); }
        .feature-card:hover::after { transform:scaleX(1); }

        /* Pillar image thumbnail */
        .feature-card-img { width:100%; height:140px; overflow:hidden; margin-bottom:2rem; position:relative; border:1px solid var(--border); }
        .feature-card-img img { width:100%; height:100%; object-fit:cover; filter:saturate(0.5) brightness(0.7); transition:transform 0.6s cubic-bezier(0.23,1,0.32,1),filter 0.4s; }
        .feature-card:hover .feature-card-img img { transform:scale(1.06); filter:saturate(0.75) brightness(0.8); }

        .feature-num { font-family:'Cormorant Garamond',serif; font-size:4rem; font-weight:300; color:var(--gold); opacity:0.1; line-height:1; margin-bottom:1.2rem; transition:opacity 0.4s; }
        .feature-card:hover .feature-num { opacity:0.25; }
        .feature-icon { font-size:1.6rem; margin-bottom:1rem; display:block; }
        .feature-card h3 { font-family:'Cormorant Garamond',serif; font-size:1.55rem; font-weight:400; margin-bottom:0.9rem; }
        .feature-card p { color:var(--text-dim); font-size:0.94rem; line-height:1.85; }

        /* ── SURVEY ── */
        .survey { padding:8rem 4rem; background:var(--survey-bg,rgba(122,140,110,0.04)); transition:background 0.4s; }
        .survey-inner { max-width:1300px; margin:0 auto; }
        .survey-header { margin-bottom:5rem; display:flex; justify-content:space-between; align-items:flex-end; }
        .survey-sub { color:var(--text-dimmer); font-size:0.84rem; letter-spacing:0.06em; margin-top:0.5rem; display:block; }

        .survey-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:0; border:1px solid var(--border); }
        .survey-card { padding:4rem 2.5rem 3rem; text-align:center; border-right:1px solid var(--border); position:relative; overflow:hidden; transition:background 0.4s; }
        .survey-card:last-child { border-right:none; }
        .survey-card:hover { background:var(--card-hover); }

        .survey-bar { position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(to right,var(--sage),var(--gold)); transform:scaleX(0); transform-origin:left; transition:transform 1.2s cubic-bezier(0.23,1,0.32,1); }
        .survey-card.counted .survey-bar { transform:scaleX(1); }

        .survey-pct { font-family:'Cormorant Garamond',serif; font-size:clamp(3rem,4vw,4.5rem); font-weight:300; line-height:1; margin-bottom:1rem; display:block; }
        .survey-card:nth-child(1) .survey-pct { color:var(--gold); }
        .survey-card:nth-child(2) .survey-pct { color:#bfa882; }
        .survey-card:nth-child(3) .survey-pct { color:var(--sage); }
        .survey-card:nth-child(4) .survey-pct { color:#9aaa8e; }
        .survey-card:nth-child(5) .survey-pct { color:var(--gold); }
        .survey-card p { font-size:0.84rem; color:var(--text-dimmer); line-height:1.65; letter-spacing:0.04em; }

        .survey-conclusion { margin-top:3rem; padding:3rem; border:1px solid var(--border); background:var(--glass); display:grid; grid-template-columns:4px 1fr; gap:2.5rem; align-items:center; }
        .conclusion-bar { background:linear-gradient(to bottom,var(--gold),var(--sage)); border-radius:100px; align-self:stretch; }
        .conclusion-text { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:300; font-style:italic; line-height:1.65; color:var(--conclusion-col,rgba(245,240,232,0.7)); transition:color 0.4s; }

        /* ── IMMERSIVE QUOTE ── */
        .immersive-quote {
          position: relative; overflow: hidden; height: 420px;
          display: flex; align-items: center; justify-content: center;
        }
        .immersive-quote-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:brightness(0.25) saturate(0.4); }
        .immersive-quote-content { position:relative; z-index:1; text-align:center; max-width:760px; padding:0 4rem; }
        .immersive-quote-content p { font-family:'Cormorant Garamond',serif; font-size:clamp(1.8rem,3vw,2.8rem); font-weight:300; font-style:italic; line-height:1.5; color:rgba(245,240,232,0.85); }
        .immersive-quote-content em { color:var(--gold); font-style:normal; }
        .immersive-divider { display:block; width:40px; height:1px; background:var(--gold); margin:2rem auto; opacity:0.5; }

        /* REVEAL */
        .reveal { opacity:0; transform:translateY(28px); transition:opacity 0.9s cubic-bezier(0.23,1,0.32,1),transform 0.9s cubic-bezier(0.23,1,0.32,1); }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-delay-1 { transition-delay:0.08s; }
        .reveal-delay-2 { transition-delay:0.16s; }
        .reveal-delay-3 { transition-delay:0.24s; }
        .reveal-delay-4 { transition-delay:0.32s; }
        .reveal-delay-5 { transition-delay:0.40s; }

        /* RESPONSIVE */
        @media (max-width:1000px) {
          .hero-inner { grid-template-columns:1fr; gap:3rem; }
          .hero-manifesto { border-left:none; border-top:1px solid var(--border); padding-left:0; padding-top:3rem; }
          .features-header { grid-template-columns:1fr; }
          .feature-grid { grid-template-columns:1fr 1fr; }
          .feature-card:last-child { grid-column:span 2; }
          .survey-grid { grid-template-columns:1fr 1fr; }
          .survey-card { border-right:none; border-bottom:1px solid var(--border); }
          .survey-card:nth-child(even) { border-left:1px solid var(--border); }
          .survey-header { flex-direction:column; align-items:flex-start; gap:1rem; }
          .showcase-strip { grid-template-columns:1fr; }
          .showcase-cell { height:240px; }
        }
        @media (max-width:700px) {
          .about-hero, .pillars-section, .survey { padding-left:2rem; padding-right:2rem; }
          .feature-grid { grid-template-columns:1fr; }
          .feature-card:last-child { grid-column:span 1; }
          .survey-grid { grid-template-columns:1fr; }
          .survey-card:nth-child(even) { border-left:none; }
          .immersive-quote-content { padding:0 2rem; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="hero-inner">
          <div className="hero-text">
            <span className="eyebrow">Our Philosophy</span>
            <h1>Why<br /><em>OneSip?</em></h1>
            <p>Revolutionizing hydration with intelligence, transparency, and the kind of convenience your body deserves every single day.</p>
          </div>
          <div className="hero-manifesto">
            <p className="manifesto-quote">"We believe the drinks you choose are as important as the food you eat. <strong>Every sip is a decision about your health.</strong>"</p>
            <span className="manifesto-meta">The OneSip Founding Principle, 2024</span>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE IMAGE STRIP ── */}
      <div className="showcase-strip">
        {[
          { src:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80&auto=format&fit=crop', tag:'Purity', caption:'Every ingredient vetted' },
          { src:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&auto=format&fit=crop', tag:'Wellness', caption:'Science-backed formulas' },
          { src:'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop', tag:'Sustainability', caption:'Responsibly sourced' },
        ].map(({src,tag,caption},i) => (
          <div className="showcase-cell" key={i}>
            <img src={src} alt={caption} loading="lazy" />
            <div className="showcase-cell-label">
              <span>{tag}</span>
              {caption}
            </div>
          </div>
        ))}
      </div>

      {/* ── PILLARS ── */}
      <section className="pillars-section">
        <div className="pillars-inner">
          <div className="features-header reveal">
            <div>
              <span className="section-label">Our Pillars</span>
              <h2 className="section-title">What Makes Us<br /><em>Different</em></h2>
            </div>
            <p className="features-desc">We didn't build another grocery app with a beverages section. We built the only marketplace designed from the ground up, exclusively for what you drink.</p>
          </div>

          <div className="feature-grid">
            {[
              { ...pillars[0], img:'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=70&auto=format&fit=crop' },
              { ...pillars[1], img:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=70&auto=format&fit=crop' },
              { ...pillars[2], img:'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=600&q=70&auto=format&fit=crop' },
              { ...pillars[3], img:'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=70&auto=format&fit=crop' },
              { ...pillars[4], img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=70&auto=format&fit=crop' },
            ].map((p, i) => (
              <div className={`feature-card reveal reveal-delay-${i+1}`} key={p.n}>
                <div className="feature-card-img">
                  <img src={p.img} alt={p.t} loading="lazy" />
                </div>
                <div className="feature-num">{p.n}</div>
                <span className="feature-icon">{p.icon}</span>
                <h3>{p.t}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMMERSIVE QUOTE BREAK ── */}
      <div className="immersive-quote reveal">
        <img
          src="https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=1600&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <div className="immersive-quote-content">
          <p>"Not every brand has the courage to be <em>honest</em> about what's in your drink.<br/>We built OneSip because we do."</p>
          <span className="immersive-divider"></span>
        </div>
      </div>

      {/* ── SURVEY ── */}
      <section className="survey">
        <div className="survey-inner">
          <div className="survey-header reveal">
            <div>
              <span className="section-label">Research & Validation</span>
              <h2 className="section-title">Built on <em>Real Insights</em></h2>
              <span className="survey-sub">Survey conducted with 100+ urban consumer respondents, 2024.</span>
            </div>
          </div>

          <div className="survey-grid">
            {surveyData.map((s, i) => (
              <div className={`survey-card reveal reveal-delay-${i+1}`} key={i}>
                <span className="survey-pct" data-target={s.target}>0%</span>
                <p>{s.label}</p>
                <div className="survey-bar"></div>
              </div>
            ))}
          </div>

          <div className="survey-conclusion reveal" style={{ marginTop: '3rem' }}>
            <div className="conclusion-bar"></div>
            <p className="conclusion-text">
              Based on these insights, OneSip implemented intelligent health-based filtering, AI-driven personalized recommendations, and a seamless subscription-based hydration system — each feature validated by real consumer demand.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}