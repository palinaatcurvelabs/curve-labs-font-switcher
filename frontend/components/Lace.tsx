import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Section } from './ui/Section';

// Code-split the heavy Three.js scene so initial load is faster.
const SemanticGraph3D = React.lazy(async () => {
  const mod = await import('./SemanticGraph3D');
  return { default: mod.SemanticGraph3D };
});

export const Lace: React.FC = () => {
  // Assets in `public/` should be referenced by absolute URL paths in Vite.
  const laceStar = '/lace-star.svg';
  // Cache-bust the background image so browsers pick up updates immediately.
  const laceBg = '/lace-bg.png?v=v4';

  const [fadeOverlayOut, setFadeOverlayOut] = useState(false);
  const [shouldLoadGraph, setShouldLoadGraph] = useState(false);
  const graphHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setFadeOverlayOut(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = graphHostRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadGraph(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoadGraph(true);
          obs.disconnect();
        }
      },
      // Start loading shortly before it scrolls into view.
      { root: null, rootMargin: '200px 0px', threshold: 0.01 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Section id="lace" className="bg-transparent pb-48 overflow-hidden">
      {/* Hide global grid within this section */}
      <div className="absolute inset-0 bg-background pointer-events-none" />

      <div className="w-full relative z-10">
        {/* Mobile header - clean background like About section */}
        <div className="lg:hidden p-8 border-b border-border bg-background relative z-20">
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            [02] Lace Research & Logs
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left: Product Intro */}
          <div className="p-8 lg:p-24 flex flex-col justify-between min-h-[600px] relative overflow-hidden">
            {/* Background image only on the left column */}
            <div
              className="absolute inset-0 bg-center bg-cover opacity-90 contrast-[1.08] saturate-[0.97]"
              style={{ backgroundImage: `url(${laceBg})` }}
            ></div>
            {/* Subtle left-to-mid fade (persistent) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.0) 66%)',
              }}
            />
            {/* Initial readability gradient that fades to 100% transparency */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent transition-opacity duration-[2200ms] ease-out ${fadeOverlayOut ? 'opacity-0' : 'opacity-100'
                }`}
            />
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #52525b 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 mt-8 md:mt-10 flex items-center gap-4">
                <img src={laceStar} alt="" className="w-12 h-12 md:w-16 md:h-16" />
                LACE
              </h2>
              <p className="text-[16px] md:text-[18px] text-white font-light leading-relaxed max-w-2xl">
                Graph-based knowledge infrastructure. Your documents, notes, and research become extensible structure with no overhead. AI for automated organization and research.
              </p>
            </div>

            <div className="relative z-10 mt-12">
              <a
                href="https://meetlace.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-base md:text-lg font-mono text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
              >
                EXPLORE LACE →
              </a>
            </div>
          </div>

          {/* Right: Articles / Terminal View */}
          <div className="border-t lg:border-t-0 lg:border-l border-border bg-background/70 backdrop-blur-sm pt-8 px-8 pb-0 lg:pt-12 lg:px-12 lg:pb-0 flex flex-col relative overflow-hidden">
            {/* Black stripe on the right edge and beyond gutter */}
            <div className="absolute top-0 right-0 bottom-0 w-10 bg-background"></div>
            <div className="absolute top-0 left-full bottom-0 w-screen bg-background"></div>
            <h3 className="hidden lg:block font-nav text-xs text-zinc-500 mb-8 uppercase tracking-widest border-b border-border pb-4 w-full">
              [02] Lace Research & Logs
            </h3>

            <div
              ref={graphHostRef}
              className="relative flex-1 min-h-[520px] border border-border bg-black/20 overflow-hidden"
            >
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
                <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-nav text-cyan-300 uppercase tracking-widest opacity-70">
                  Semantic Graph // 3D
                </span>
              </div>
              {shouldLoadGraph ? (
                <Suspense
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="font-nav text-[10px] uppercase tracking-widest text-zinc-500">
                        Loading graph…
                      </div>
                    </div>
                  }
                >
                  <SemanticGraph3D />
                </Suspense>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="font-nav text-[10px] uppercase tracking-widest text-zinc-600">
                    Scroll to load
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </Section>
  );
};
