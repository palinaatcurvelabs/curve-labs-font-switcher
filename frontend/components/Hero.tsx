import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-950">

      {/* Centered content overlay - positioned below navbar with explicit height for proper centering */}
      <div className="absolute top-20 left-0 right-0 h-[calc(100vh-80px)] z-10 flex items-center justify-center pointer-events-none">
        <div className="max-w-[1400px] px-8 flex flex-col items-center relative -mt-[280px]">


          {/* "We Build" SVG */}
          <div className="mb-0 md:mb-1 flex justify-center w-full">
            <img
              src="/we_build.svg"
              alt="We Build"
              className="w-[75vw] md:w-[55vw] max-w-[850px] h-auto"
            />
          </div>

          {/* "Digital Souls" ASCII art SVG */}
          <div className="w-[88vw] md:w-[73vw] max-w-[1280px] mt-4 mx-auto relative" style={{ aspectRatio: '1303.4 / 271.46' }}>
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
