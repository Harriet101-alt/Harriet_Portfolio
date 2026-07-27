import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { profile1, profile2, profile3 } from '../../assets';
import { useDarkMode } from '../../hooks/useDarkMode';

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
// Strap drop length — tuned independently of SCALE (how far it falls).
// 320 = 180 + 140: the 140px used to live as a `top` offset on the whole
// Lanyard wrapper in About.tsx (anchor+strap+clip+card all pushed down
// together), which left a floating gap above the strap instead of the rope
// visibly running from the anchor at the top of the collage down to the
// card. That offset was moved here instead, so the anchor sits at the true
// top (root top: 0) and the strap itself covers the distance — the card's
// absolute position is unchanged (see About.tsx's Lanyard wrapper comment).
const STRAP_LENGTH = 320;
const CLIP_WIDTH = px(36);
const CLIP_HEIGHT = px(14);
const CARD_WIDTH = px(250);
const CARD_HEIGHT = px(340);
const CARD_PADDING = px(12);
const PHOTO_WIDTH = CARD_WIDTH - CARD_PADDING * 2;
const PHOTO_HEIGHT = Math.round(PHOTO_WIDTH * 4 / 3);  // 3:4 portrait aspect ratio
const CONTAINER_WIDTH = CARD_WIDTH + px(48);   // keeps the badge centred within the 380px collage column

const MAX_ROTATION = 20;
const MAX_TWIST = 12;                         // max roll rotation on vertical axis
const DRAG_ROTATION_FACTOR = 0.3;
const DRAG_TWIST_FACTOR = 0.2;                // twist increases with drag
const PROXIMITY_RADIUS = 160;
const PROXIMITY_MAX_ROTATION = 10;
const SCROLL_IMPULSE_AMPLITUDE = 25;          // initial swing amplitude from scroll
const CARD_TILT_FACTOR = 0.35;                // 3D tilt multiplier (rotateX)
const IDLE_SWAY_AMPLITUDE = 2.5;              // tiny amplitude for idle oscillation
const IDLE_SWAY_FREQUENCY = 0.8;              // cycles per second for idle motion

// Entrance spring — slightly underdamped for visible damped decay
const entranceSpringConfig = { tension: 280, friction: 28, mass: 1 };

// Swing spring — critically damped for responsive but tight settling
const swingSpringConfig = { tension: 240, friction: 34, mass: 1 };

// Idle sway spring — very soft and slow
const idleSwaySpringConfig = { tension: 60, friction: 12, mass: 1 };

const profilePhotos = [
  { src: profile1, alt: 'Harriet Fletcher profile photo 1', objectPosition: 'center top' },
  { src: profile2, alt: 'Harriet Fletcher profile photo 2 (Cordoba)', objectPosition: 'left center' },
  { src: profile3, alt: 'Harriet Fletcher profile photo 4', objectPosition: 'center top' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Lanyard() {
  const { isDarkMode } = useDarkMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasSettledRef = useRef<boolean>(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastScrollTimeRef = useRef<number>(0);
  const idleOscillatorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);
  const clickAffordanceColor = isDarkMode ? '#FFF5F7' : '#000000';

  // Spring state with multiple physical degrees of freedom:
  // y: vertical drop offset (starts -180 = above rest position)
  // rotation: yaw swing (left-right pendulum)
  // twist: roll on vertical axis (spinning)
  // idleSwayRotation: continuous idle oscillation
  // strapCompressionY and cardTiltX are computed from rotation in the transforms
  const [{ rotation, y, twist, idleSwayRotation }, api] = useSpring(() => ({
    rotation: -8,
    y: -180,
    twist: 0,
    idleSwayRotation: 0,
    config: entranceSpringConfig,
  }));

  // Idle oscillation: subtle continuous sway when nothing is happening
  const startIdleOscillation = useCallback(() => {
    if (idleOscillatorRef.current) clearInterval(idleOscillatorRef.current);

    let phase = 0;
    const dt = 16; // ~60fps
    const cycleDuration = (1000 / IDLE_SWAY_FREQUENCY); // ms per cycle

    idleOscillatorRef.current = setInterval(() => {
      phase += (dt / cycleDuration) * Math.PI * 2;
      const sway = Math.sin(phase) * IDLE_SWAY_AMPLITUDE;
      const twist_sway = Math.cos(phase * 1.3) * (IDLE_SWAY_AMPLITUDE * 0.4);

      if (!isDraggingRef.current && hasSettledRef.current) {
        api.start({
          idleSwayRotation: sway,
          twist: twist_sway,
          config: idleSwaySpringConfig,
        });
      }
    }, dt);
  }, [api]);

  const stopIdleOscillation = useCallback(() => {
    if (idleOscillatorRef.current) {
      clearInterval(idleOscillatorRef.current);
      idleOscillatorRef.current = null;
    }
  }, []);

  // On mount: drop into place, then run damped pendulum decay sequence
  useEffect(() => {
    console.log('🎯 Lanyard mount: starting entrance animation');
    api.start({
      to: async (next) => {
        // Phase 1 — fall under gravity, slight bounce on catch
        await next({
          y: 0,
          config: { tension: 210, friction: 14, mass: 1.5 },
        });
        // Phase 2 — damped pendulum: each peak ~70% of the last, alternating sides
        // This creates a naturally decaying oscillation (underdamped entrance)
        await next({ rotation: 24, config: entranceSpringConfig });
        await next({ rotation: -17, config: entranceSpringConfig });
        await next({ rotation: 11, config: entranceSpringConfig });
        await next({ rotation: -7, config: entranceSpringConfig });
        await next({ rotation: 4, config: entranceSpringConfig });
        await next({ rotation: -2, config: entranceSpringConfig });
        await next({ rotation: 0, config: entranceSpringConfig });
        // Gate all interactive swings behind this flag
        console.log('✅ Entrance animation complete, enabling interactions');
        hasSettledRef.current = true;
        // Start idle oscillation once settled
        startIdleOscillation();
      },
    });
  }, [api, startIdleOscillation]);

  // Drag interaction: apply rotation and twist, stop idle sway
  const bind = useDrag(({ down, movement: [mx] }) => {
    console.log('🖱️ Drag detected:', { down, mx, hasSettled: hasSettledRef.current });
    if (!hasSettledRef.current) {
      console.log('❌ Drag blocked: entrance animation not yet settled');
      return;
    }
    isDraggingRef.current = down;

    if (down) {
      stopIdleOscillation();
      const rotAngle = clamp(mx * DRAG_ROTATION_FACTOR, -MAX_ROTATION, MAX_ROTATION);
      const twistAngle = clamp(mx * DRAG_TWIST_FACTOR, -MAX_TWIST, MAX_TWIST);
      api.start({
        rotation: rotAngle,
        twist: twistAngle,
        config: swingSpringConfig,
      });
    } else {
      api.start({
        rotation: 0,
        twist: 0,
        config: swingSpringConfig,
      });
      startIdleOscillation();
    }
  });

  // Scroll-driven swing: detect scroll velocity and apply spring impulse
  // This replaces hardcoded setTimeout with physics-driven decay
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (isDraggingRef.current || !hasSettledRef.current) {
        console.log('⏸️ Scroll scroll blocked:', { isDragging: isDraggingRef.current, hasSettled: hasSettledRef.current });
        return;
      }
      console.log('📜 Scroll detected, checking velocity...');

      const currentTime = Date.now();
      const timeSinceLastScroll = currentTime - lastScrollTimeRef.current;
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Calculate scroll velocity (pixels per ms, then normalize)
      const scrollVelocity = timeSinceLastScroll > 0 ? scrollDelta / timeSinceLastScroll : 0;

      // Convert velocity to angular impulse (clamped)
      const impulse = clamp(scrollVelocity * SCROLL_IMPULSE_AMPLITUDE, -SCROLL_IMPULSE_AMPLITUDE, SCROLL_IMPULSE_AMPLITUDE);

      // Only trigger if velocity is above a small threshold
      if (Math.abs(impulse) > 1) {
        stopIdleOscillation();
        // Apply impulse to rotation and correlated twist
        api.start({
          rotation: impulse > 0 ? SCROLL_IMPULSE_AMPLITUDE : -SCROLL_IMPULSE_AMPLITUDE,
          twist: impulse * 0.4,
          config: swingSpringConfig,
        });
        // Resume idle sway after a delay
        const resumeIdleTimer = setTimeout(() => {
          if (!isDraggingRef.current) {
            startIdleOscillation();
          }
        }, 1200);
        scrollTimerRef.current.push(resumeIdleTimer);
      }

      lastScrollY = currentScrollY;
      lastScrollTimeRef.current = currentTime;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollTimerRef.current.forEach(clearTimeout);
      scrollTimerRef.current = [];
    };
  }, [api, startIdleOscillation, stopIdleOscillation]);

  // Mouse proximity — gentle magnetic repulsion; gated behind hasSettled
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDraggingRef.current || !hasSettledRef.current) {
        console.log('🚫 Proximity blocked:', { isDragging: isDraggingRef.current, hasSettled: hasSettledRef.current });
        return;
      }
      const container = containerRef.current;
      if (!container) {
        console.log('🚫 Container ref not found');
        return;
      }
      console.log('👁️ Proximity check running');

      const rect = container.getBoundingClientRect();
      const badgeCenterX = rect.left + CONTAINER_WIDTH / 2;
      const badgeCenterY = rect.top + ANCHOR_SIZE + STRAP_LENGTH + CLIP_HEIGHT + CARD_HEIGHT / 2;
      const dx = e.clientX - badgeCenterX;
      const dy = e.clientY - badgeCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < PROXIMITY_RADIUS) {
        stopIdleOscillation();
        const strength = (1 - dist / PROXIMITY_RADIUS) * PROXIMITY_MAX_ROTATION;
        api.start({
          rotation: clamp((-dx / dist) * strength, -PROXIMITY_MAX_ROTATION, PROXIMITY_MAX_ROTATION),
          config: swingSpringConfig,
        });
      } else {
        api.start({ rotation: 0, config: swingSpringConfig });
        startIdleOscillation();
      }
    },
    [api, startIdleOscillation, stopIdleOscillation],
  );

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current || !hasSettledRef.current) return;
    api.start({ rotation: 0, config: swingSpringConfig });
    startIdleOscillation();
  }, [api, startIdleOscillation]);

  const handleProfileClick = useCallback(() => {
    setProfilePhotoIndex((currentIndex) => (currentIndex + 1) % profilePhotos.length);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scrollTimerRef.current.forEach(clearTimeout);
      if (idleOscillatorRef.current) clearInterval(idleOscillatorRef.current);
    };
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
          transform: y.to((yVal: number) => `translateY(${yVal}px)`),
        }}
      >
        {/* Inner rotation layer — pendulum swing (yaw), drag target, with 3D perspective */}
        <animated.div
          {...bind()}
          role="img"
          aria-label="Harriet Fletcher's conference ID badge — drag to swing"
          style={{
            transformOrigin: 'top center',
            // Combine multiple transforms: yaw swing + twist (roll) + 3D tilt + idle sway
            transform: rotation.to((r: number) =>
              twist.to((twst: number) =>
                idleSwayRotation.to((idleSway: number) => {
                  const totalRotation = r + idleSway;
                  const tilt = totalRotation * CARD_TILT_FACTOR;
                  return `rotateZ(${totalRotation}deg) rotateX(${tilt}deg) rotateY(${twst}deg)`;
                })
              )
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
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
                color: clickAffordanceColor,
                fontFamily: '"DK Crayonista", "Comic Sans MS", cursive',
                fontSize: `${px(18)}px`,
                fontWeight: 900,
                textShadow: isDarkMode
                  ? '0 1px 0 rgba(15,23,42,0.85), 0 0 10px rgba(255,245,247,0.45)'
                  : '0 1px 0 rgba(255,255,255,0.85), 0 0 1px rgba(0,0,0,0.35)',
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
                  objectPosition: currentProfilePhoto.objectPosition,
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
