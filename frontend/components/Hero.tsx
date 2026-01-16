import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-950">

      {/* Centered content overlay - positioned below navbar with explicit height for proper centering */}
      <div className="absolute top-20 left-0 right-0 h-[calc(100vh-80px)] z-10 flex items-center justify-center pointer-events-none">
        <div className="max-w-[1400px] px-8 flex flex-col items-center relative -mt-[280px]">


          {/* "We Build" text */}
          <p
            className="font-stitch-warrior mb-0 md:mb-1 text-[60px] md:text-[89.54px] leading-none text-center"
            style={{
              color: '#FFFFFF66',
              fontWeight: 400,
              fontStyle: 'normal',
              wordSpacing: '-0.4em',
            }}
          >
            We Build
          </p>

          {/* "Digital Souls" ASCII art SVG */}
          <div className="w-[90vw] md:w-[75vw] max-w-[1300px] mt-4 mx-auto relative" style={{ aspectRatio: '1303.4 / 271.46' }}>
            <img
              src="/digital-souls.svg"
              alt="Digital Souls"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Tagline - positioned at bottom */}
      <div className="absolute bottom-60 md:bottom-40 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <p
          className="text-zinc-400 font-mono uppercase text-[14px] md:text-[24.9px] leading-tight md:leading-none text-center px-4"
          style={{
            fontWeight: 400,
            fontStyle: 'normal',
          }}
        >
          Venture laboratory for relational technologies.
        </p>
      </div>

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(9, 9, 11, 0.4) 100%)',
        }}
      />
    </section>
  );
};
