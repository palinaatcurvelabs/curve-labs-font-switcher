import React, { useEffect, useState } from 'react';
import { Section } from './ui/Section';

export const About: React.FC = () => {
  const [isSerif, setIsSerif] = useState(false);

  useEffect(() => {
    const checkFont = () => {
      const styleTag = document.getElementById('font-switcher-style');
      if (styleTag?.textContent?.includes('Cardo')) {
        setIsSerif(true);
      } else {
        setIsSerif(false);
      }
    };

    checkFont();
    const observer = new MutationObserver(checkFont);
    const styleTag = document.getElementById('font-switcher-style');
    if (styleTag) {
      observer.observe(styleTag, { childList: true, characterData: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

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
                <p className={`text-zinc-300 leading-relaxed font-normal text-left lg:text-justify ${isSerif ? 'text-[22px]' : 'text-[16px]'}`}>
                  We are experimentalists who build production software as research, exploring affordances of new technological paradigms.
                </p>
                <p className={`text-zinc-300 leading-relaxed font-normal text-left lg:text-justify mt-6 ${isSerif ? 'text-[22px]' : 'text-[16px]'}`}>
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
              <div className="relative" style={{ backgroundColor: '#000000' }}>
                <div
                  data-us-project-src="/about-animation.json"
                  className="w-[320px] h-[430px] lg:w-[540px] lg:h-[730px]"
                  style={{ maxWidth: '100%', backgroundColor: '#000000' }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Section>
  );
};
