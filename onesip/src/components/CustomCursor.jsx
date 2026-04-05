import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        body { cursor: none; }
        .cursor { width:8px; height:8px; background:var(--gold, #c9a96e); border-radius:50%; position:fixed; pointer-events:none; z-index:9999; mix-blend-mode:difference; transform: translate(-50%, -50%); transition: transform 0.1s ease-out; }
        .cursor-ring { width:36px; height:36px; border:1px solid rgba(201,169,110,0.5); border-radius:50%; position:fixed; pointer-events:none; z-index:9998; transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s, transform 0.15s ease-out; }
      `}</style>
      <div className="cursor" style={{ left: pos.x, top: pos.y }} />
      <div className="cursor-ring" style={{ left: pos.x, top: pos.y }} />
    </>
  );
}