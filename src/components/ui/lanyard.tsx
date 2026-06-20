import { useCallback, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { profile1 } from '../../assets';

// This is a literal physical object (a real conference ID badge), so its
// colours are fixed hex values rather than theme tokens — it does not
// respond to light/dark mode, same treatment as the strap/clip/card in
// the reference design.
const SANS_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

const ANCHOR_SIZE = 10;
const STRAP_WIDTH = 18;
const STRAP_LENGTH = 140;
const CLIP_WIDTH = 36;
const CLIP_HEIGHT = 14;
const CARD_WIDTH = 280;
const CARD_HEIGHT = 340;
const CONTAINER_WIDTH = CARD_WIDTH + 80;

const MAX_ROTATION = 35;
const DRAG_ROTATION_FACTOR = 0.3;
const PROXIMITY_RADIUS = 160;
const PROXIMITY_MAX_ROTATION = 10;
const SCROLL_SWING_AMPLITUDE = 20;

const springConfig = { tension: 280, friction: 28, mass: 1 };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Lanyard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasSettledRef = useRef<boolean>(false);

  // y: vertical drop offset (starts -180 = above rest position)
  // rotation: pendulum swing angle — starts at 0, no initial tilt
  const [{ rotation, y }, api] = useSpring(() => ({
    rotation: 0,
    y: -180,
    config: springConfig,
  }));

  // On mount: drop into place, then gentle left-first symmetric pendulum
  useEffect(() => {
    api.start({
      to: async (next) => {
        // Phase 1 — fall under gravity
        await next({ y: 0, config: { tension: 210, friction: 16, mass: 1.4 } });
        // Phase 2 — gentle symmetric decay: left first so both sides are equally visible
        await next({ rotation: -10, config: { tension: 180, friction: 14 } });
        await next({ rotation:   7, config: { tension: 185, friction: 16 } });
        await next({ rotation:  -3, config: { tension: 190, friction: 20 } });
        await next({ rotation:   0, config: { tension: 200, friction: 24 } });
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

      api.start({
        to: async (next) => {
          await next({ rotation: -SCROLL_SWING_AMPLITUDE, config: { tension: 220, friction: 18 } });
          await next({ rotation:  0,                      config: { tension: 220, friction: 22 } });
        },
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
              borderRadius: '7px',
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
                width: '18px',
                height: '5px',
                borderRadius: '3px',
                background: '#B0B0B0',
              }}
            />
          </div>

          {/* Badge card */}
          <div
            style={{
              width: `${CARD_WIDTH}px`,
              minHeight: `${CARD_HEIGHT}px`,
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 10px 40px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Photo */}
            <img
              src={profile1}
              alt=""
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{
                width: '256px',
                height: '240px',
                objectFit: 'cover',
                objectPosition: 'center top',
                borderRadius: '12px',
                display: 'block',
                marginBottom: '12px',
                pointerEvents: 'none',
              }}
            />

            {/* Name */}
            <span style={{ fontFamily: SANS_FONT, fontSize: '18px', fontWeight: 600, color: '#1A1A1A', margin: '0 4px 2px', display: 'block' }}>
              Harriet Fletcher
            </span>

            {/* Role */}
            <span style={{ fontFamily: SANS_FONT, fontSize: '14px', fontWeight: 400, color: '#6B6B6B', margin: '0 4px 8px', display: 'block' }}>
              Junior Developer
            </span>

            {/* Divider */}
            <div style={{ borderTop: '1.5px dashed #E0E0E0', width: '100%', marginBottom: '8px' }} />

            {/* Footer row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
              <span style={{ fontFamily: SANS_FONT, fontSize: '13px', fontWeight: 500, color: '#9B9B9B' }}>ID</span>
              <span style={{ fontFamily: MONO_FONT, fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>ID-HF-26</span>
            </div>
          </div>
        </animated.div>
      </animated.div>
    </div>
  );
}
