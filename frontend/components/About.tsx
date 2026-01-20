import React, { useEffect } from 'react';
import { Section } from './ui/Section';

export const About: React.FC = () => {
  useEffect(() => {
    // 1. Load the Script
    const scriptId = 'unicorn-studio-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.2/dist/unicornStudio.umd.js";
      script.onload = () => {
        // @ts-ignore
        if (window.UnicornStudio) {
          // @ts-ignore
          window.UnicornStudio.init();
        }
      };
      document.body.appendChild(script);
    } else {
      // @ts-ignore
      if (window.UnicornStudio) {
        // @ts-ignore
        window.UnicornStudio.init();
      }
    }

    // 2. Targeted Watermark Removal (Best Effort JS)
    const removeWatermark = () => {
      const links = document.querySelectorAll('a[href*="unicorn.studio"]');
      links.forEach((link) => {
        const el = link as HTMLElement;
        el.style.setProperty('display', 'none', 'important');

        let parent = el.parentElement;
        let levels = 0;
        while (parent && levels < 5) {
          const rect = parent.getBoundingClientRect();
          if (rect.width > 0 && rect.width < 350 && rect.height < 100) {
            parent.style.setProperty('display', 'none', 'important');
            parent.style.setProperty('visibility', 'hidden', 'important');
            parent.style.setProperty('opacity', '0', 'important');
            parent.style.setProperty('pointer-events', 'none', 'important');
          } else if (rect.width > 350 || rect.height > 100) {
            break;
          }
          parent = parent.parentElement;
          levels++;
        }
      });
    };

    const intervalId = setInterval(removeWatermark, 50);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Section id="about" className="bg-background">
      <div className="max-w-[1600px] mx-auto border-x border-border">
        <div className="p-8 lg:p-12 border-b border-border">
          <h2 className="font-mono text-xs text-zinc-500 uppercase tracking-widest">[03] About</h2>
        </div>

        <div className="p-8 lg:p-12 min-h-[70vh] flex items-center" style={{ backgroundColor: '#000000' }}>
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">

            {/* Left: Text Content - Left Aligned */}
            <div className="flex flex-col justify-center items-start w-full lg:w-1/2 z-10 order-1 lg:order-1">
              <h3 className="font-bold tracking-tight text-white leading-none mb-8 px-0 lg:pl-16" style={{ fontSize: '30px' }}>
                About
              </h3>
              <div className="px-0 lg:pl-16">
                <p className="text-zinc-300 leading-relaxed font-light text-left lg:text-justify" style={{ fontSize: '20px' }}>
                  We are experimentalists who build production software as research, exploring affordances of new technological paradigms.
                </p>
                <p className="text-zinc-300 leading-relaxed font-light text-left lg:text-justify mt-6" style={{ fontSize: '20px' }}>
                  Extending individual capabilities towards self-actualisation while exploring non-coercive pathways towards collective cohesion are primary motivations behind our expeditions into the dark forest.
                </p>

                <div className="pt-8 opacity-80 border-t border-white/10 mt-8">
                  <p className="font-mono text-[13px] text-zinc-500 tracking-[0.2em] uppercase">
                    Est 2020. Berlin.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Unicorn Studio Animation Embed */}
            <div className="w-full lg:w-1/2 flex items-center justify-center order-2 lg:order-2 pointer-events-auto relative">
              {/* Wrapper with relative positioning for the cover box */}
              <div className="relative" style={{ backgroundColor: '#000000' }}>
                <div
                  data-us-project="uTMlhzSdg1bVKwFrGPmr"
                  className="w-[320px] h-[430px] lg:w-[540px] lg:h-[730px]"
                  style={{ maxWidth: '100%', backgroundColor: '#000000' }}
                />

                {/* 
                    Black Box Cover-up 
                    Positioned to obscure the watermark at the bottom center.
                    Matches the page background color.
                */}
                <div
                  className="absolute z-50 pointer-events-none"
                  style={{
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '220px',
                    height: '60px',
                    backgroundColor: '#000000'
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Section>
  );
};
