import React from 'react';

export const Navbar: React.FC = () => {
  // Assets in `public/` should be referenced by absolute URL paths in Vite.
  const curveLogo = '/curve-labs-logo.png';

  const handleNavClick =
    (id: string) =>
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        // Tell App's hash handler to animate this navigation.
        (window as any).__clHashScrollAnimate = true;
        window.history.pushState(null, '', `#${id}`);
        // pushState doesn't emit hashchange; dispatch so App handles scrolling consistently.
        window.dispatchEvent(new Event('hashchange'));
      };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={curveLogo} alt="Curve Labs" className="h-8 w-auto" />
          <span className="font-mono text-base font-bold tracking-[0.1em] uppercase">Curve Labs</span>
        </div>

        <div className="hidden md:flex gap-10">
          <a
            href="#offerings"
            onClick={handleNavClick('offerings')}
            className="font-mono text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            [01] DOMAINS
          </a>
          <a href="#lace" onClick={handleNavClick('lace')} className="font-mono text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            [02] LACE
          </a>
          <a href="#about" onClick={handleNavClick('about')} className="font-mono text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            [03] ABOUT
          </a>
          <a href="#team" onClick={handleNavClick('team')} className="font-mono text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            [04] TEAM
          </a>
        </div>

        <div className="hidden sm:block w-32"></div>
      </div>
    </nav>
  );
};

