import React, { useEffect, useRef, useState } from 'react';

interface UnicornFlowerProps {
  className?: string;
}

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

export const UnicornFlower: React.FC<UnicornFlowerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ destroy: () => void } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load the Unicorn Studio SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/AliaksandrD/unicornstudio.js@1.0.0/dist/index.js';
    script.async = true;

    script.onload = async () => {
      if (window.UnicornStudio && containerRef.current) {
        try {
          const scene = await window.UnicornStudio.addScene({
            elementId: 'unicorn-flower-container',
            fps: 60,
            scale: 1,
            dpi: 1.5,
            filePath: '/unicorn-flower.json',
            lazyLoad: true,
          });
          sceneRef.current = scene;
          setIsLoaded(true);
        } catch (error) {
          console.error('Failed to load Unicorn scene:', error);
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
      }
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="unicorn-flower-container"
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
};
