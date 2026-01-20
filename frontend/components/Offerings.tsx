import React from 'react';
import { Section } from './ui/Section';

interface DomainItem {
  id: string;
  number: string;
  title: string;
  description: string;
  imageSrc: string;
}

const domains: DomainItem[] = [
  {
    id: 'psyche',
    number: '01',
    title: 'Psyche',
    description: 'Cognitive systems for individuals and human-AI collaboration.\n\nWe build systems that extend how you think—knowledge graphs that grow with use, dynamic context retrieval, composable ontologies. The interface between your mind and your machines.',
    imageSrc: '/domains/polis.jpg',
  },
  {
    id: 'polis',
    number: '02',
    title: 'Polis',
    description: 'Collective coordination and multi-agent systems.\n\nWe build systems that extend how groups act—agents that manage treasuries, support group cohesion and decision-making. Infrastructuring collective agency.',
    imageSrc: '/domains/psyche.jpg',
  }
];

export const Offerings: React.FC = () => {
  return (
    <Section id="offerings" noBorderBottom className="bg-transparent border-t-0 pt-32 min-h-screen overflow-hidden">
      {/* One-piece fade from global grid -> solid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(9,9,11,1) 0%, rgba(9,9,11,1) 100%)',
        }}
      />

      {/* Decorative Grid Lines */}
      <div className="relative max-w-[1680px] mx-auto">
        <div className=""></div>
      </div>
      <div className="max-w-[1680px] mx-auto pb-64 relative z-10">
        {/* Decorative corner lines (as drawn) */}
        <div className="hidden sm:block pointer-events-none absolute left-0 top-0 h-px w-[420px] bg-border/70" />

        <div className="grid grid-cols-1 sm:grid-cols-4">

          {/* Header Column */}
          <div className="p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-border">
            <h2 className="font-nav text-xs text-zinc-500 mb-4 uppercase tracking-widest">[01] Domains</h2>
            <h3 className="text-xl sm:text-3xl font-header font-bold mb-6 tracking-tight">Domains</h3>
            <p className="text-zinc-300 text-[18px] leading-relaxed font-body-text">
              Our digital souls operate at two scales.
            </p>
          </div>

          {/* Domains Grid - Spanning 3 columns */}
          <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-1 relative">
            {/* Bottom-left vertical + bottom-right horizontal accents */}
            <div className="hidden sm:block pointer-events-none absolute left-0 top-full h-40 w-px bg-border/70" />
            <div className="hidden sm:block pointer-events-none absolute right-0 top-full h-px w-20 bg-border/70" />

            {domains.map((domain, idx) => (
              <div
                key={domain.id}
                className={`
                  group border-b border-border bg-black min-h-[380px] sm:min-h-[460px] h-full relative overflow-hidden
                  ${idx === 0 ? 'sm:border-r' : ''}
                  transition-colors duration-300
                `}
              >
                {/* Background image (B/W -> color on hover) */}
                <img
                  src={domain.imageSrc}
                  alt=""
                  className={`
                    absolute inset-0 h-full w-full object-cover
                    grayscale saturate-0 opacity-70
                    will-change-transform
                    group-hover:grayscale-0 group-hover:saturate-100 group-hover:opacity-95
                    ${idx === 0
                      ? // Psyche (left): subtle drift + zoom
                      'group-hover:scale-[1.06] group-hover:translate-x-[-1.5%] group-hover:translate-y-[-1%]'
                      : // Polis (right): slow zoom + slight rotation
                      'group-hover:scale-[1.07] group-hover:rotate-[1.25deg]'}
                  `}
                  style={{
                    // Keep the slow transform drift/zoom, but bring color in faster.
                    transition:
                      'transform 5200ms ease-out, filter 900ms ease-out, opacity 900ms ease-out',
                  }}
                />

                {/* Readability overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
                <div className="absolute inset-0 ring-1 ring-inset ring-border" />

                {/* Number pinned to top */}
                <div className="absolute left-8 top-8 sm:left-12 sm:top-12 z-10 font-nav text-3xl text-zinc-200 transition-colors group-hover:text-white">
                  {domain.number}
                </div>

                {/* Content pinned to bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-8 sm:px-12 py-8 sm:py-12 text-left flex flex-col-reverse">
                  <p className="text-zinc-200 text-[18px] leading-relaxed font-body-text h-[150px] overflow-hidden">
                    {domain.description}
                  </p>
                  <h4 className="text-[30px] font-header font-bold mb-4 text-white">{domain.title}</h4>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Section>
  );
};
