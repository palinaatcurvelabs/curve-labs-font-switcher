import React, { useEffect, useState } from 'react';

type FontOption = 'inter' | 'cardo' | 'darker-grotesque';

const FONT_OPTIONS = [
  { id: 'inter' as const, name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'cardo' as const, name: 'Cardo', family: 'Cardo, serif' },
  { id: 'darker-grotesque' as const, name: 'Darker Grotesque', family: 'Darker Grotesque, sans-serif' },
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
        /* Force Darker Grotesque everywhere except mono */
        * {
          font-family: ${selectedFontData.family} !important;
        }

        /* Keep mono fonts */
        .font-mono,
        [class*="font-mono"],
        code,
        pre,
        kbd,
        samp,
        button.font-mono *,
        label.font-mono,
        input.font-mono,
        textarea.font-mono {
          font-family: 'JetBrains Mono', monospace !important;
        }

        /* Always keep LACE title in Inter */
        .lace-title-inter {
          font-family: Inter, sans-serif !important;
        }

        /* Adjust bio text size for Cardo */
        ${selectedFont === 'cardo' ? `
        .font-body-text.text-sm {
          font-size: 16px !important;
        }
        ` : ''}

        /* Adjust font sizes for Darker Grotesque - 4px larger + regular weight + tighter line height */
        ${selectedFont === 'darker-grotesque' ? `
        * {
          font-weight: 400 !important;
        }
        p, .leading-relaxed {
          line-height: 1.3 !important;
        }
        .text-\\[16px\\] {
          font-size: 20px !important;
        }
        .text-\\[18px\\] {
          font-size: 22px !important;
        }
        .text-\\[20px\\] {
          font-size: 24px !important;
        }
        .text-\\[22px\\] {
          font-size: 26px !important;
        }
        .text-\\[30px\\] {
          font-size: 34px !important;
        }
        .md\\:text-\\[20px\\] {
          font-size: 24px !important;
        }
        .md\\:text-\\[22px\\] {
          font-size: 26px !important;
        }
        .font-body-text.text-sm {
          font-size: 18px !important;
        }
        .font-bold, [class*="font-bold"] {
          font-weight: 700 !important;
        }
        .font-semibold, [class*="font-semibold"] {
          font-weight: 600 !important;
        }
        .font-medium, [class*="font-medium"] {
          font-weight: 500 !important;
        }
        ` : ''}
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
