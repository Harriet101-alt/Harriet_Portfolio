import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Z_LAYERS } from '../lib/zLayers';
import { useThemeColors } from '../hooks/useThemeColors';
import { useScrollDirection } from '../hooks/useScrollDirection';

export interface CorkboardStickerData {
  id: number;
  image: string;
  // Resting position, as an offset in px from the board's centre.
  x: number;
  y: number;
  mobileX: number;
  mobileY: number;
}

type ScreenTier = 'small' | 'mobile' | 'desktop';

function getScreenTier(): ScreenTier {
  const w = window.innerWidth;
  if (w < 375) return 'small';
  if (w < 768) return 'mobile';
  return 'desktop';
}

// Stable pseudo-random in [-1, 1] for a given seed — same sticker always
// gets the same resting tilt, no layout jitter between renders.
function seededSpread(seed: number) {
  const v = Math.sin(seed * 999.7) * 10000;
  return (v - Math.floor(v)) * 2 - 1;
}

const DRAG_CONFIG = { tension: 320, friction: 24 };
const SETTLE_CONFIG = { tension: 260, friction: 22 };
const SCROLL_CONFIG = { tension: 120, friction: 26 };

// 2cm at the CSS reference resolution (96px/in ÷ 2.54cm/in). The corkboard's
// container clips with overflow:hidden, so this is safe to apply literally
// at every breakpoint rather than shrinking it for smaller screens.
const SLIDE_AWAY_PX = 75.6;

function CorkboardSticker({ data, tier, dropShadowColor, scrolledDown }: { data: CorkboardStickerData; tier: ScreenTier; dropShadowColor: string; scrolledDown: boolean }) {
  const baseRotation = useMemo(() => seededSpread(data.id) * 12, [data.id]); // ±12deg at rest
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const isActive = hovering || dragging;

  const size = tier === 'small' ? 50 : tier === 'mobile' ? 60 : 80;
  // How far the sticker can be nudged from its resting spot — its
  // constrained "patch" of corkboard. Small enough on every breakpoint
  // that it can never reach the lanyard column or the map section.
  const radius = tier === 'small' ? 24 : tier === 'mobile' ? 32 : 48;
  const shrink = tier === 'small' ? 0.6 : 1;
  const centerX = (tier === 'desktop' ? data.x : data.mobileX) * shrink;
  const centerY = (tier === 'desktop' ? data.y : data.mobileY) * shrink;

  // Direction each sticker slides away from the journal on scroll-down —
  // radiating outward from wherever it already sits on the board, so the
  // motion reads as the stickers being pushed off the journal, not a
  // uniform drift. Stickers resting dead-centre (no offset of their own)
  // fall back to a stable per-sticker random angle instead of a zero vector.
  const [slideDX, slideDY] = useMemo(() => {
    const hasOffset = centerX !== 0 || centerY !== 0;
    const angle = hasOffset ? Math.atan2(centerY, centerX) : seededSpread(data.id + 200) * Math.PI;
    return [Math.cos(angle) * SLIDE_AWAY_PX, Math.sin(angle) * SLIDE_AWAY_PX];
  }, [centerX, centerY, data.id]);

  // The [] dep arrays below are load-bearing: `useSpring(fn)` without one
  // re-invokes the factory every render (react-spring's "reactive" form),
  // silently re-applying its literal return value as the target each time —
  // fighting every later .start() call from drag/hover/scroll on any
  // re-render this component's parent causes. With [], the factory runs
  // once on mount; every subsequent update goes through .start() only.
  const [{ x, y, rot, lift, shadow }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: baseRotation,
    lift: 0,
    shadow: 6,
    config: SETTLE_CONFIG,
  }), []);

  const [{ sx, sy }, scrollApi] = useSpring(() => ({
    sx: 0,
    sy: 0,
    config: SCROLL_CONFIG,
  }), []);

  useEffect(() => {
    scrollApi.start({ sx: scrolledDown ? slideDX : 0, sy: scrolledDown ? slideDY : 0 });
  }, [scrollApi, scrolledDown, slideDX, slideDY]);

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    setDragging(down);
    api.start({
      x: mx,
      y: my,
      rot: down ? baseRotation * 0.3 : baseRotation,
      lift: down ? -4 : 0,
      shadow: down ? 16 : 6,
      config: DRAG_CONFIG,
    });
  }, {
    bounds: { left: -radius, right: radius, top: -radius, bottom: radius },
    rubberband: true,
  });

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
    api.start({ rot: 0, lift: -8, shadow: 18, config: SETTLE_CONFIG });
  }, [api]);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    api.start({ rot: baseRotation, lift: 0, shadow: 6, config: SETTLE_CONFIG });
  }, [api, baseRotation]);

  return (
    <animated.img
      {...bind()}
      src={data.image}
      alt=""
      draggable={false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'absolute',
        left: `calc(50% + ${centerX}px)`,
        top: `calc(50% + ${centerY}px)`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '8px',
        touchAction: 'none',
        userSelect: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: isActive ? Z_LAYERS.stickerActive : Z_LAYERS.stickers,
        transform: to([x, y, lift, rot, sx, sy], (xv, yv, liftv, rv, sxv, syv) => `translate(${(xv as number) + (sxv as number)}px, ${(yv as number) + (liftv as number) + (syv as number)}px) rotate(${rv}deg)`),
        filter: shadow.to((s: number) => `drop-shadow(0 ${s}px ${s * 1.6}px ${dropShadowColor})`),
        willChange: 'transform, filter',
      }}
    />
  );
}

export default function StickerCorkboard({ stickers }: { stickers: CorkboardStickerData[] }) {
  const [tier, setTier] = useState<ScreenTier>(() => (typeof window === 'undefined' ? 'desktop' : getScreenTier()));
  const themeColors = useThemeColors();
  const containerRef = useRef<HTMLDivElement>(null);
  // True once the page has scrolled down (vs. up) since the last direction
  // change — drives the stickers sliding away from / back toward the
  // journal underneath them.
  const scrolledDown = useScrollDirection();

  useEffect(() => {
    const onResize = () => setTier(getScreenTier());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ isolation: 'isolate', overflow: 'hidden' }}
      aria-hidden="true"
    >
      {stickers.map((sticker) => (
        <CorkboardSticker key={sticker.id} data={sticker} tier={tier} dropShadowColor={themeColors.effects.dropShadow} scrolledDown={scrolledDown} />
      ))}
    </div>
  );
}
