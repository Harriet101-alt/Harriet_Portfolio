import { useEffect, useRef, useState } from 'react';

// A dead-zone, not a raw delta sign — a few px of jitter from trackpad
// momentum or mobile overscroll bounce would otherwise flip the direction
// on every animation frame.
const DIRECTION_THRESHOLD_PX = 4;

// True once the page has scrolled down past the dead-zone since the last
// direction change; false again once it's scrolled back up past it.
export function useScrollDirection(): boolean {
  const [scrolledDown, setScrolledDown] = useState(false);
  const lastY = useRef(typeof window === 'undefined' ? 0 : window.scrollY);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (delta > DIRECTION_THRESHOLD_PX) {
        setScrolledDown(true);
        lastY.current = y;
      } else if (delta < -DIRECTION_THRESHOLD_PX) {
        setScrolledDown(false);
        lastY.current = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return scrolledDown;
}
