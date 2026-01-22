import React, { useLayoutEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Offerings } from './components/Offerings';
import { Lace } from './components/Lace';
import { About } from './components/About';
import { Team } from './components/Team';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import ContactOverlay from './components/ContactOverlay';
import { FontSwitcher } from './components/FontSwitcher';

let activeScrollRaf: number | null = null;

const smoothScrollTo = (top: number, durationMs = 900) => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (prefersReducedMotion || durationMs <= 0) {
    window.scrollTo({ top });
    return;
  }

  if (activeScrollRaf !== null) window.cancelAnimationFrame(activeScrollRaf);

  const startY = window.scrollY;
  const delta = top - startY;
  const startT = performance.now();

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const step = (now: number) => {
    const t = Math.min(1, (now - startT) / durationMs);
    window.scrollTo({ top: startY + delta * ease(t) });
    if (t < 1) activeScrollRaf = window.requestAnimationFrame(step);
  };

  activeScrollRaf = window.requestAnimationFrame(step);
};

function App() {
  useLayoutEffect(() => {
    let isInitialRun = true;

    const scrollToSection = (
      id: string,
      align: 'center' | 'start' | 'end' = 'center',
      durationMs = 900
    ) => {
      const el = document.getElementById(id);
      if (!el) return false;

      const nav = document.querySelector('nav');
      const navHeight = nav ? nav.getBoundingClientRect().height : 0;

      const rect = el.getBoundingClientRect();
      const elTop = window.scrollY + rect.top;
      const elHeight = rect.height;

      const visibleViewportHeight = Math.max(0, window.innerHeight - navHeight);
      const visibleViewportCenterY = navHeight + visibleViewportHeight / 2;

      let targetTop = 0;
      if (align === 'start') {
        targetTop = elTop - navHeight;
      } else if (align === 'end') {
        targetTop = elTop + elHeight - (navHeight + visibleViewportHeight);
      } else {
        const elCenter = elTop + elHeight / 2;
        targetTop = elCenter - visibleViewportCenterY;
      }

      const maxTop = document.documentElement.scrollHeight - window.innerHeight;
      targetTop = Math.max(0, Math.min(targetTop, Math.max(0, maxTop)));

      smoothScrollTo(targetTop, durationMs);
      return true;
    };

    const scrollFromLocationHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) {
        // On first load without a hash, always start at the top (avoid "end of page" restores).
        if (isInitialRun) {
          // Be extra defensive: some browsers/extensions can still restore scroll
          // after our early index.tsx scroll reset.
          window.scrollTo({ top: 0, left: 0 });
          window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
          window.setTimeout(() => window.scrollTo({ top: 0, left: 0 }), 250);
        }
        isInitialRun = false;
        return;
      }
      isInitialRun = false;

      // TEAM should land "all the way down to" its start (top-aligned under nav).
      const align: 'center' | 'start' | 'end' = id === 'team' ? 'start' : 'center';

      // If triggered by navbar click, animate; otherwise (refresh/direct URL) snap immediately.
      const shouldAnimate = Boolean((window as any).__clHashScrollAnimate);
      (window as any).__clHashScrollAnimate = false;
      const firstDuration = shouldAnimate ? 900 : 0;
      if (!shouldAnimate) {
        // On refresh/direct URL, ensure we don't start at a restored bottom position.
        window.scrollTo({ top: 0, left: 0 });
      }

      // Retry a few times (mount/layout shifts) so refresh on /#team always lands correctly.
      let attempts = 0;
      const run = () => {
        attempts += 1;
        const ok = scrollToSection(id, align, attempts === 1 ? firstDuration : 0);
        if (!ok && attempts < 10) {
          window.setTimeout(run, 80 * attempts);
          return;
        }
        // Re-align after layout settles (images/fonts).
        if (attempts === 1) {
          window.setTimeout(() => scrollToSection(id, align, 0), 250);
          window.setTimeout(() => scrollToSection(id, align, 0), 900);
        }
      };

      // Wait a tick so layout is stable.
      window.requestAnimationFrame(run);
    };

    scrollFromLocationHash();
    window.addEventListener('hashchange', scrollFromLocationHash);
    window.addEventListener('popstate', scrollFromLocationHash);
    return () => {
      window.removeEventListener('hashchange', scrollFromLocationHash);
      window.removeEventListener('popstate', scrollFromLocationHash);
      if (activeScrollRaf !== null) window.cancelAnimationFrame(activeScrollRaf);
      activeScrollRaf = null;
    };
  }, []);

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const handleOpenForm = () => {
    setIsFormOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative overflow-x-hidden">
      {/* Base dark background */}
      <div className="fixed inset-0 bg-background z-0"></div>

      {/* Global decorative background grid */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-60"
        style={{
          backgroundImage: 'linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          // Offset so we don't get a prominent line at the very top / under the nav.
          backgroundPosition: '60px 60px',
        }}>
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Offerings />
          <Lace />
          <About />
          <Team />
          <CTA onOpen={handleOpenForm} />
        </main>
        <Footer />
      </div>

      <React.Suspense fallback={null}>
        <ContactOverlay isOpen={isFormOpen} onClose={handleCloseForm} />
      </React.Suspense>

      <FontSwitcher />
    </div>
  );
}

export default App;
