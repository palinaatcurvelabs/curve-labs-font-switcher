import React, { useEffect, useState } from 'react';

type FontOption = 'inter' | 'cardo' | 'work-sans';

const FONT_OPTIONS = [
  { id: 'inter' as const, name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'cardo' as const, name: 'Cardo', family: 'Cardo, serif' },
  { id: 'work-sans' as const, name: 'Work Sans', family: '"Work Sans", sans-serif' },
];

export const FontSwitcher: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<FontOption>('inter');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply font to all text elements directly
    const selectedFontData = FONT_OPTIONS.find(f => f.id === selectedFont);

    if (selectedFontData) {
      // Create a style tag to override font-family
      let styleTag = document.getElementById('font-switcher-style') as HTMLStyleElement;

      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'font-switcher-style';
        document.head.appendChild(styleTag);
      }

      styleTag.textContent = `
        body *:not(.font-mono):not([class*="font-mono"]):not(nav):not(nav *):not(code):not(pre):not(kbd):not(samp) {
          font-family: ${selectedFontData.family} !important;
        }
        /* Specifically target non-mono elements */
        .font-sans:not(.font-mono),
        .font-header:not(.font-mono),
        .font-body-text:not(.font-mono),
        h1:not(.font-mono),
        h2:not(.font-mono),
        h3:not(.font-mono):not([class*="font-mono"]),
        h4:not(.font-mono),
        h5:not(.font-mono),
        h6:not(.font-mono),
        p:not(.font-mono):not([class*="font-mono"]),
        [class*="font-header"]:not(.font-mono),
        [class*="font-body-text"]:not(.font-mono) {
          font-family: ${selectedFontData.family} !important;
        }
      `;
    }
  }, [selectedFont]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-zinc-900 border border-border rounded-lg overflow-hidden shadow-xl min-w-[200px]">
            <div className="p-3 border-b border-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Select Font
              </div>
            </div>
            <div className="py-2">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => {
                    setSelectedFont(font.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    ${selectedFont === font.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }
                  `}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-zinc-900 border border-border rounded-full w-14 h-14 flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-xl"
          aria-label="Toggle font switcher"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
