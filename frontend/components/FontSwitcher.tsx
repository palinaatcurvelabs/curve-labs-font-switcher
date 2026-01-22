import React, { useEffect, useState } from 'react';

type FontOption = 'darker-grotesque' | 'cardo' | 'eb-garamond';

const FONT_OPTIONS = [
  { id: 'darker-grotesque' as const, name: 'Darker Grotesque', family: 'Darker Grotesque' },
  { id: 'cardo' as const, name: 'Cardo', family: 'Cardo' },
  { id: 'eb-garamond' as const, name: 'EB Garamond', family: 'EB Garamond' },
];

export const FontSwitcher: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<FontOption>('darker-grotesque');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update CSS variables when font changes
    const root = document.documentElement;
    const selectedFontData = FONT_OPTIONS.find(f => f.id === selectedFont);

    if (selectedFontData) {
      root.style.setProperty('--font-main', selectedFontData.family);
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
