import { useEffect, useState, type RefObject } from 'react';

// 1 when the given element is centred in the viewport, falling to 0 as it
// scrolls toward either edge. Shared by StickerCorkboard and the hero
// collage so both "assemble in / fly apart on scroll" effects are driven by
// the exact same formula, not two copies that can drift apart.
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [scrollProgress, setScrollProgress] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScrollProgress(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      const maxDist = vh / 2 + rect.height / 2;
      const dist = Math.abs(center - vh / 2);
      setScrollProgress(maxDist > 0 ? 1 - Math.min(1, dist / maxDist) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  return scrollProgress;
}
