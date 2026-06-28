import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { profile1, profile2, profile3 } from '../../assets';

// This is a literal physical object (a real conference ID badge), so its
// colours are fixed hex values rather than theme tokens — it does not
// respond to light/dark mode, same treatment as the strap/clip/card in
// the reference design.
const SANS_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

// Overall badge size multiplier — scales the card, clip, photo and text
// together. Bump this single number to resize the whole badge.
const SCALE = 1.25;
const px = (n: number) => Math.round(n * SCALE);

const ANCHOR_SIZE = px(10);
const STRAP_WIDTH = px(18);
const STRAP_LENGTH = 180;          // strap drop length — tuned independently of SCALE (how far it falls)
const CLIP_WIDTH = px(36);
const CLIP_HEIGHT = px(14);
const CARD_WIDTH = px(250);
const CARD_HEIGHT = px(340);
const CARD_PADDING = px(12);
const PHOTO_WIDTH = CARD_WIDTH - CARD_PADDING * 2;
const PHOTO_HEIGHT = px(185);
const CONTAINER_WIDTH = CARD_WIDTH + px(48);   // keeps the badge centred within the 380px collage column

const MAX_ROTATION = 20;
const DRAG_ROTATION_FACTOR = 0.3;
const PROXIMITY_RADIUS = 160;
const PROXIMITY_MAX_ROTATION = 10;
const SCROLL_SWING_AMPLITUDE = 20;
const SCROLL_SWING_BACK = 8;   // ← one value, used both ways
const SCROLL_SETTLE_DELAY = 260;

const springConfig = { tension: 280, friction: 28, mass: 1 };

const profilePhotos = [
  { src: profile1, alt: 'Harriet Fletcher profile photo 1' },
  { src: profile2, alt: 'Harriet Fletcher profile photo 2' },
  { src: profile3, alt: 'Harriet Fletcher profile photo 4' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Lanyard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasSettledRef = useRef<boolean>(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);

  // y: vertical drop offset (starts -180 = above rest position)
  // rotation: pendulum swing angle
  const [{ rotation, y }, api] = useSpring(() => ({
    rotation: -8,
    y: -180,
    config: springConfig,
  }));

  // On mount: drop into place, then run damped pendulum decay sequence
  useEffect(() => {
    api.start({
      to: async (next) => {
        // Phase 1 — fall under gravity, slight bounce on catch
        await next({ y: 0, config: { tension: 210, friction: 14, mass: 1.5 } });
        // Phase 2 — damped pendulum: each peak ~70% of the last, alternating sides
        await next({ rotation: 24,  config: { tension: 170, friction: 11 } });
        await next({ rotation: -17, config: { tension: 170, friction: 12 } });
        await next({ rotation: 11,  config: { tension: 175, friction: 14 } });
        await next({ rotation: -7,  config: { tension: 180, friction: 16 } });
        await next({ rotation: 4,   config: { tension: 185, friction: 18 } });
        await next({ rotation: -2,  config: { tension: 190, friction: 20 } });
        await next({ rotation: 0,   config: { tension: 200, friction: 24 } });
        // Gate all interactive swings behind this flag
        hasSettledRef.current = true;
      },
    });
  // api is stable — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bind = useDrag(({ down, movement: [mx] }) => {
    if (!hasSettledRef.current) return;
    isDraggingRef.current = down;
    if (down) {
      api.start({ rotation: clamp(mx * DRAG_ROTATION_FACTOR, -MAX_ROTATION, MAX_ROTATION) });
    } else {
      api.start({ rotation: 0 });
    }
  });

  // Scroll-triggered pendulum swing — only fires after initial sequence settles
  useEffect(() => {
    const handleScroll = () => {
      if (isDraggingRef.current || !hasSettledRef.current) return;
      scrollTimerRef.current.forEach(clearTimeout);
      scrollTimerRef.current = [];

      api.start({ rotation: -SCROLL_SWING_AMPLITUDE });
      scrollTimerRef.current.push(setTimeout(() => {
        api.start({ rotation: SCROLL_SWING_AMPLITUDE });
      }, 90));
      scrollTimerRef.current.push(setTimeout(() => {
        api.start({ rotation: SCROLL_SWING_BACK });
      }, 180));
      scrollTimerRef.current.push(setTimeout(() => {
        api.start({ rotation: 0 });
      }, SCROLL_SETTLE_DELAY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollTimerRef.current.forEach(clearTimeout);
    };
  }, [api]);

  // Mouse proximity — gentle magnetic repulsion; gated behind hasSettled
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDraggingRef.current || !hasSettledRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const badgeCenterX = rect.left + CONTAINER_WIDTH / 2;
      const badgeCenterY = rect.top + ANCHOR_SIZE + STRAP_LENGTH + CLIP_HEIGHT + CARD_HEIGHT / 2;
      const dx = e.clientX - badgeCenterX;
      const dy = e.clientY - badgeCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < PROXIMITY_RADIUS) {
        const strength = (1 - dist / PROXIMITY_RADIUS) * PROXIMITY_MAX_ROTATION;
        api.start({ rotation: clamp((-dx / dist) * strength, -PROXIMITY_MAX_ROTATION, PROXIMITY_MAX_ROTATION) });
      } else {
        api.start({ rotation: 0 });
      }
    },
    [api],
  );

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current || !hasSettledRef.current) return;
    api.start({ rotation: 0 });
  }, [api]);

  const handleProfileClick = useCallback(() => {
    setProfilePhotoIndex((currentIndex) => (currentIndex + 1) % profilePhotos.length);
  }, []);

  const currentProfilePhoto = profilePhotos[profilePhotoIndex];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: `${CONTAINER_WIDTH}px`,
        height: `${ANCHOR_SIZE + STRAP_LENGTH + CLIP_HEIGHT + CARD_HEIGHT + 10}px`,
      }}
    >
      {/* Anchor ball — fixed pivot, never moves */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${ANCHOR_SIZE}px`,
          height: `${ANCHOR_SIZE}px`,
          borderRadius: '50%',
          background: '#C8C8C8',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          zIndex: 3,
        }}
      />

      {/* Outer drop layer — translates vertically on entrance */}
      <animated.div
        style={{
          position: 'absolute',
          top: `${ANCHOR_SIZE}px`,
          left: '50%',
          width: `${CARD_WIDTH}px`,
          marginLeft: `-${CARD_WIDTH / 2}px`,
          transform: y.to((yVal) => `translateY(${yVal}px)`),
        }}
      >
        {/* Inner rotation layer — pendulum swing, drag target */}
        <animated.div
          {...bind()}
          role="img"
          aria-label="Harriet Fletcher's conference ID badge — drag to swing"
          style={{
            transformOrigin: 'top center',
            transform: rotation.to((r) => `rotate(${r}deg)`),
            touchAction: 'none',
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          {/* Strap */}
          <div
            style={{
              width: `${STRAP_WIDTH}px`,
              height: `${STRAP_LENGTH}px`,
              margin: '0 auto',
              background: 'repeating-linear-gradient(to right, #1e1e1e 0px, #1e1e1e 2px, #2e2e2e 2px, #2e2e2e 4px)',
            }}
          />

          {/* Clip / connector */}
          <div
            style={{
              width: `${CLIP_WIDTH}px`,
              height: `${CLIP_HEIGHT}px`,
              margin: '0 auto',
              borderRadius: `${px(7)}px`,
              background: '#D0D0D0',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${px(18)}px`,
                height: `${px(5)}px`,
                borderRadius: `${px(3)}px`,
                background: '#B0B0B0',
              }}
            />
          </div>

          {/* Badge card */}
          <div
            style={{
              width: `${CARD_WIDTH}px`,
              minHeight: `${CARD_HEIGHT}px`,
              borderRadius: `${px(20)}px`,
              background: '#FFFFFF',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 10px 40px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
              padding: `${CARD_PADDING}px`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: `${px(-42)}px`,
                right: `${px(-78)}px`,
                width: `${px(118)}px`,
                height: `${px(78)}px`,
                color: '#000000',
                fontFamily: '"DK Crayonista", "Comic Sans MS", cursive',
                fontSize: `${px(18)}px`,
                fontWeight: 900,
                textShadow: '0 1px 0 rgba(255,255,255,0.85), 0 0 1px rgba(0,0,0,0.35)',
                letterSpacing: '0.02em',
                pointerEvents: 'none',
                transform: 'rotate(-8deg)',
                zIndex: 2,
              }}
            >
              <span style={{ position: 'absolute', top: 0, right: 0 }}>click here</span>
              <svg
                viewBox="0 0 118 78"
                width={px(118)}
                height={px(78)}
                fill="none"
                style={{ position: 'absolute', left: 0, top: px(8), overflow: 'visible' }}
              >
                <path
                  d="M105 15 C70 20 76 58 35 55"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="5 7"
                />
                <path
                  d="M39 47 L25 56 L41 65"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Photo */}
            <button
              type="button"
              aria-label="Change lanyard profile photo"
              onClick={handleProfileClick}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                appearance: 'none',
                border: 0,
                background: 'transparent',
                padding: 0,
                width: `${PHOTO_WIDTH}px`,
                height: `${PHOTO_HEIGHT}px`,
                borderRadius: `${px(12)}px`,
                display: 'block',
                marginBottom: `${px(12)}px`,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <img
                src={currentProfilePhoto.src}
                alt={currentProfilePhoto.alt}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </button>

            {/* Name */}
            <span style={{ fontFamily: SANS_FONT, fontSize: `${px(18)}px`, fontWeight: 600, color: '#1A1A1A', margin: `0 ${px(4)}px ${px(2)}px`, display: 'block' }}>
              Harriet Fletcher
            </span>

            {/* Role */}
            <span style={{ fontFamily: SANS_FONT, fontSize: `${px(14)}px`, fontWeight: 400, color: '#6B6B6B', margin: `0 ${px(4)}px ${px(8)}px`, display: 'block' }}>
              Junior Developer
            </span>

            {/* Divider */}
            <div style={{ borderTop: '1.5px dashed #E0E0E0', width: '100%', marginBottom: `${px(8)}px` }} />

            {/* Footer row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${px(4)}px` }}>
              <span style={{ fontFamily: SANS_FONT, fontSize: `${px(13)}px`, fontWeight: 500, color: '#9B9B9B' }}>ID</span>
              <span style={{ fontFamily: MONO_FONT, fontSize: `${px(13)}px`, fontWeight: 700, color: '#1A1A1A' }}>ID-HF-26</span>
            </div>
          </div>
        </animated.div>
      </animated.div>
    </div>
  );
}
