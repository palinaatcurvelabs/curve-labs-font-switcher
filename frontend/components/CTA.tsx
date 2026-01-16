import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Section } from './ui/Section';

export const CTA: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => {
  return (
    <Section id="contact" className="bg-background">
      <div className="max-w-[1600px] mx-auto border-x border-border flex flex-col lg:flex-row">

        {/* Text side */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col gap-10 justify-center items-start text-left relative overflow-hidden">


          <div className="relative z-10 space-y-4 w-full mt-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
              The Lab is open.
            </h2>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl font-mono">
              Get in touch.
            </p>
          </div>
        </div>

        {/* Arrow action side */}
        <button
          onClick={onOpen}
          className="w-full lg:w-64 xl:w-80 min-h-[140px] lg:min-h-[320px] border-t lg:border-t-0 lg:border-l border-border bg-background flex items-center justify-center cursor-pointer text-white group relative overflow-hidden appearance-none"
          style={{ transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#fff'; }}
        >
          <ArrowRight
            className="w-12 h-12 lg:w-16 lg:h-16 group-hover:translate-x-2 group-hover:scale-110"
            style={{ transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </button>
      </div>
    </Section>
  );
};
