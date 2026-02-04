import React, { useState, useRef, useEffect } from 'react';

type AnimationMode = 'flower' | 'liquify' | 'flow' | 'sphere';

// Declare the UnicornStudio global for TypeScript
declare global {
  interface Window {
    UnicornStudio?: {
      addScene: (options: {
        elementId: string;
        fps?: number;
        scale?: number;
        dpi?: number;
        projectId?: string;
        filePath?: string;
        lazyLoad?: boolean;
        production?: boolean;
      }) => Promise<{ destroy: () => void }>;
    };
  }
}

// Unicorn Studio animation file paths
const UNICORN_ANIMATION_FILES: Record<AnimationMode, string> = {
  flower: '/unicorn-flower.json',
  liquify: '/unicorn-liquify.json',
  flow: '/flow.json',
  sphere: '/unicorn-sphere.json',
};

// Animation mode labels for UI
const ANIMATION_LABELS: Record<AnimationMode, string> = {
  flower: 'Flower',
  liquify: 'Liquify',
  flow: 'Flow',
  sphere: 'Sphere',
};

export const Hero: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('liquify');
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ destroy: () => void } | null>(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const lastSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Load the Unicorn Studio animation
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    async function initScene() {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Destroy existing scene if any
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
        setSceneLoaded(false);
      }

      if (window.UnicornStudio) {
        try {
          // Use device pixel ratio for proper resolution on all screens
          const dpi = window.devicePixelRatio || 1;
          
          const scene = await window.UnicornStudio.addScene({
            elementId: 'animation-container',
            fps: 60,
            scale: 1,
            dpi: dpi,
            filePath: UNICORN_ANIMATION_FILES[animationMode],
            lazyLoad: true,
          });
          sceneRef.current = scene;
          setSceneLoaded(true);
          
          // Store current size
          lastSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
        } catch (error) {
          console.error('Failed to load scene:', error);
        }
      }
    }

    // Handle resize - reinitialize scene when window size changes significantly
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        const lastSize = lastSizeRef.current;
        
        // Reinitialize if size changed by more than 100px in either direction
        const widthDiff = Math.abs(currentWidth - lastSize.width);
        const heightDiff = Math.abs(currentHeight - lastSize.height);
        
        if (widthDiff > 100 || heightDiff > 100) {
          initScene();
        }
      }, 250); // Debounce resize events
    }

    // Load the SDK script
    const existingScript = document.querySelector('script[src*="unicornstudio.js"]');
    if (existingScript) {
      // Script already loaded, try to initialize
      initScene();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/AliaksandrD/unicornstudio.js@1.0.0/dist/index.js';
      script.async = true;
      script.onload = () => initScene();
      document.body.appendChild(script);
    }

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
        setSceneLoaded(false);
      }
    };
  }, [animationMode]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-950">

      {/* Toggle buttons for switching animation modes */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Animation</span>
        <div className="flex flex-wrap gap-2 max-w-[200px]">
          {(Object.keys(ANIMATION_LABELS) as AnimationMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setAnimationMode(mode)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                animationMode === mode
                  ? 'bg-white text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {ANIMATION_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Centered content overlay - positioned below navbar with explicit height for proper centering */}
      <div className="absolute top-20 left-0 right-0 h-[calc(100vh-80px)] z-10 flex items-center justify-center pointer-events-none">
        <div className="max-w-[1400px] px-8 flex flex-col items-center relative -mt-[280px]">

          {/* "We Build Digital Souls" with animation */}
          <div
            ref={containerRef}
            className="relative flex justify-center w-full pointer-events-auto cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Animation - behind SVG */}
            <div className="relative w-[90vw] md:w-[75vw] max-w-[1200px]">
              {/* Unicorn Studio animation container - centered behind the text */}
              <div
                id="animation-container"
                className="absolute z-0 transition-opacity duration-500"
                style={{
                  opacity: isHovered ? 1 : 0.6,
                  width: '150%',
                  height: '150%',
                  left: '-25%',
                  top: '-25%',
                  minHeight: '500px',
                }}
              />

              {/* SVG text on top */}
              <img
                src="/we_build_digital_souls.svg"
                alt="We Build Digital Souls"
                className="w-full h-auto relative z-10"
              />
            </div>
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
