import React, { useEffect, useState } from 'react';

/* --- Simple Grid Cell --- */

const GridCell: React.FC = () => {
  return (
    <div className="relative w-full h-full border border-zinc-800/60">
      {/* Small corner marker */}
      <div className="absolute top-0 right-0 p-1">
        <div className="w-1 h-1 bg-zinc-800" />
      </div>
    </div>
  );
};

export const HeroGridBackground: React.FC = () => {
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Density (match reference feel)
  const cellSize = 140;
  const cols = Math.ceil(windowSize.w / cellSize) + 1;
  const rows = Math.ceil(windowSize.h / cellSize) + 1;
  const totalCells = cols * rows;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-auto bg-zinc-950"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        justifyContent: 'center',
      }}
    >
      {windowSize.w > 0 && Array.from({ length: totalCells }).map((_, i) => (
        <GridCell key={i} />
      ))}
      {/* Bottom fade-to-black gradient for smooth scroll transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, #09090b)' }}
      />
    </div>
  );
};
