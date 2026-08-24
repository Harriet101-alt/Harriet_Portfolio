import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useSpring, animated, to } from '@react-spring/web';

const SCROLL_CONFIG = { tension: 120, friction: 26 };

// Same deterministic pseudo-random used by StickerCorkboard, for the rare
// item with centerX = centerY = 0 (no natural outward direction).
function seededSpread(seed: number) {
  const v = Math.sin(seed * 999.7) * 10000;
  return (v - Math.floor(v)) * 2 - 1;
}

export interface ScatterOnScrollProps {
  /** This item's centre, as an offset in px from its board's centre — picks
   *  which direction it scatters toward (radiating outward), same approach
   *  as StickerCorkboard. */
  centerX: number;
  centerY: number;
  /** 1 = settled at rest, 0 = fully scattered. From useScrollProgress. */
  scrollProgress: number;
  /** Static rest rotation, combined with the scroll-driven translate. */
  rotateDeg?: number;
  distance?: number;
  seed?: number;
  /** Outer positioning only (position/top/left/right/zIndex) — do not put a
   *  transform here, the rotation goes through `rotateDeg` instead so it can
   *  compose with the animated scatter translate. */
  style?: CSSProperties;
  children: ReactNode;
}

export default function ScatterOnScroll({
  centerX,
  centerY,
  scrollProgress,
  rotateDeg = 0,
  distance = 140,
  seed = 0,
  style,
  children,
}: ScatterOnScrollProps) {
  const [dx, dy] = useMemo(() => {
    const hasOffset = centerX !== 0 || centerY !== 0;
    const angle = hasOffset ? Math.atan2(centerY, centerX) : seededSpread(seed + 200) * Math.PI;
    return [Math.cos(angle) * distance, Math.sin(angle) * distance];
  }, [centerX, centerY, distance, seed]);

  // The [] dep array is load-bearing: without it, `useSpring(fn)` re-invokes
  // the factory on every render (it's react-spring's "reactive" form, not a
  // useState-style lazy initializer) and silently re-applies {sx: dx, sy:
  // dy} as the target every time — fighting the .start() calls below on
  // every re-render this component's parent causes (e.g. the name
  // typewriter), so the scatter appeared to never leave its "fully
  // scattered" starting pose. With [], the factory runs once; all later
  // updates go through the effect's explicit .start() calls only.
  const [{ sx, sy }, api] = useSpring(() => ({ sx: dx, sy: dy, config: SCROLL_CONFIG }), []);

  useEffect(() => {
    api.start({ sx: dx * (1 - scrollProgress), sy: dy * (1 - scrollProgress) });
  }, [api, scrollProgress, dx, dy]);

  return (
    <div style={style}>
      <animated.div
        style={{
          transform: to([sx, sy], (x, y) => `translate(${x}px, ${y}px) rotate(${rotateDeg}deg)`),
        }}
      >
        {children}
      </animated.div>
    </div>
  );
}
