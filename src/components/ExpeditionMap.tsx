import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WAYPOINTS, type Waypoint, type WaypointIcon } from '../data/waypoints';
import { useDarkMode } from '../contexts/DarkModeContext';
import { withAlpha } from '../hooks/useThemeColors';

// ─── PALETTE & TYPE TOKENS ───────────────────────────────────────────────────

const PAPER = '#f5f0e8';
const INK = '#1a1208';
const INK_LIGHT = '#5c4f3a';
const INK_FAINT = '#a09278';
const PENCIL = '#8a8070';

const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
const FONT_BODY = '"Lora", Georgia, serif';
const FONT_MONO = '"Courier Prime", "Courier New", monospace';

const SECTION_HEIGHT_DESKTOP = 340;
const SECTION_HEIGHT_MOBILE = 260;
const MIN_GAP_DESKTOP = 160;
const MIN_GAP_MOBILE = 124;
const MOBILE_BREAKPOINT = 760;
const INSET = 80;

const ROUTE_DURATION = 900;
const ROUTE_STAGGER = 200;
const PIN_STAGGER = 180;

// Pin geometry — the pin is a lollipop: circular head, needle stem, then label.
// The pin is anchored by its HEAD CENTRE, so the circle sits directly on the
// trail (the bezier path runs through `positions`) and the needle crosses below.
const PIN_HEAD_HEIGHT = 26;       // matches pin-head div height
const PIN_NEEDLE_HEIGHT = 16;     // matches pin needle div height
const PIN_HEAD_CENTER_OFFSET = PIN_HEAD_HEIGHT / 2; // 13 — container top = anchorY - half the head

// Explorer character geometry (matches the ExplorerCharacter svg below)
const EXPLORER_SVG_HEIGHT = 52;
const EXPLORER_FOOT_Y = 46;       // shoe baseline within the 0 0 44 52 viewBox
// translate(-50%, -50%) centers the sprite on `top`, so its feet sit this far
// below `top`; subtracting it lands the feet exactly on the trail (the anchor).
const EXPLORER_FOOT_FROM_CENTER = EXPLORER_FOOT_Y - EXPLORER_SVG_HEIGHT / 2; // 20

// Per-waypoint horizontal nudges (pixels, index matches WAYPOINTS order) — used
// only to spread overlapping markers; both the pins and the trail share them so
// they never drift apart.
// [Liverpool, Lancaster, Kuala Lumpur, Seville, University of Liverpool]
const PIN_X_OFFSETS = [0, 0, 0, -60, -160];

function getRouteStart(i: number) {
  return i * ROUTE_STAGGER;
}
function getRouteComplete(i: number) {
  return getRouteStart(i) + ROUTE_DURATION;
}
function getPinDelay(i: number) {
  return i === 0 ? 0 : getRouteComplete(i - 1) + i * PIN_STAGGER;
}

interface PinPosition {
  x: number;
  y: number;
}

function computeLayout(
  containerWidth: number,
  count: number,
  minGap: number,
  sectionHeight: number,
): { positions: PinPosition[]; trackWidth: number } {
  const neededWidth = (count - 1) * minGap;
  const usableWidth = Math.max(containerWidth - INSET * 2, neededWidth);
  const gap = count > 1 ? usableWidth / (count - 1) : 0;
  const baseY = sectionHeight / 2;
  const positions = Array.from({ length: count }, (_, i) => ({
    x: INSET + i * gap,
    y: baseY + (i % 2 === 0 ? -16 : 16),
  }));
  const trackWidth = INSET * 2 + gap * (count - 1);
  return { positions, trackWidth };
}

// ─── CUBIC BEZIER PATH HELPERS ───────────────────────────────────────────────

interface BezierSegment {
  p0: PinPosition; p1: PinPosition; p2: PinPosition; p3: PinPosition;
}

function buildBezierSegments(positions: PinPosition[]): BezierSegment[] {
  return positions.slice(0, -1).map((p0, i) => {
    const p3 = positions[i + 1];
    const dx = p3.x - p0.x;
    return {
      p0,
      p1: { x: p0.x + dx * 0.30, y: p0.y },
      p2: { x: p3.x - dx * 0.30, y: p3.y },
      p3,
    };
  });
}

// Evaluate a point on a cubic Bezier segment at parameter t ∈ [0, 1].
function getCubicPoint(seg: BezierSegment, t: number): PinPosition {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: mt3 * seg.p0.x + 3 * mt2 * t * seg.p1.x + 3 * mt * t2 * seg.p2.x + t3 * seg.p3.x,
    y: mt3 * seg.p0.y + 3 * mt2 * t * seg.p1.y + 3 * mt * t2 * seg.p2.y + t3 * seg.p3.y,
  };
}

// Position along the whole route. `progress` is a float where the integer part
// selects a segment and the fraction is its local t (0 = first pin, N = last pin).
function getExplorerPosition(progress: number, segs: BezierSegment[]): PinPosition {
  if (!segs.length) return { x: 0, y: 0 };
  if (progress <= 0) return segs[0].p0;
  if (progress >= segs.length) return segs[segs.length - 1].p3;
  const idx = Math.floor(Math.min(progress, segs.length - 1));
  return getCubicPoint(segs[idx], progress - idx);
}

// Serialize a bezier segment to an SVG path string. Pins, trail, and explorer
// all consume the same segments, so the dashed line passes exactly through each
// pin's anchor and the explorer walks the line it draws.
function bezierSegmentPath(seg: BezierSegment): string {
  return `M ${seg.p0.x} ${seg.p0.y} C ${seg.p1.x} ${seg.p1.y}, ${seg.p2.x} ${seg.p2.y}, ${seg.p3.x} ${seg.p3.y}`;
}

function formatCoordinate(lat: number, lng: number) {
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = Math.round((Math.abs(lat) - latDeg) * 60);
  const lngDeg = Math.floor(Math.abs(lng));
  const lngMin = Math.round((Math.abs(lng) - lngDeg) * 60);
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${latDeg}°${latMin}'${latDir}  ${lngDeg}°${lngMin}'${lngDir}`;
}

// ─── HAND-DRAWN ICONS ────────────────────────────────────────────────────────

function HouseIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

function LeafIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c-1-7 2-13 14-15 2 12-4 16-14 15Z" />
      <path d="M6 18C9 13 12 10 18 5" />
    </svg>
  );
}

function CompassIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      <path d="M12 7l2.4 4.6L19 14l-4.6 2.4L12 21l-2.4-4.6L5 14l4.6-2.4Z" />
    </svg>
  );
}

function CircuitIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M8 6h8M6 8v4l6 6M18 8v4l-6 6" />
    </svg>
  );
}

function WaypointGlyph({ icon, color }: { icon: WaypointIcon; color: string }) {
  switch (icon) {
    case 'house':
      return <HouseIcon color={color} />;
    case 'leaf':
      return <LeafIcon color={color} />;
    case 'compass':
      return <CompassIcon color={color} />;
    case 'circuit':
      return <CircuitIcon color={color} />;
    default:
      return null;
  }
}

// ─── ROUTE PATH (draws itself on scroll, then settles into a dashed trail) ──

function RoutePath({ d, color, drawn, delay }: { d: string; color: string; drawn: boolean; delay: number }) {
  const ref = useRef<SVGPathElement | null>(null);
  const [length, setLength] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setLength(ref.current.getTotalLength());
      setRevealed(false); // reset so draw animation replays when path shape changes
    }
  }, [d]);

  useEffect(() => {
    if (!drawn) setRevealed(false);
  }, [drawn]);

  return (
    <path
      ref={ref}
      d={d}
      stroke={color}
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={revealed ? '6 4' : length || 1}
      strokeDashoffset={drawn ? 0 : length}
      style={{ transition: `stroke-dashoffset ${ROUTE_DURATION}ms ease-in-out ${delay}ms` }}
      onTransitionEnd={(e) => {
        if (drawn && e.propertyName === 'stroke-dashoffset') setRevealed(true);
      }}
    />
  );
}

// ─── PIN ─────────────────────────────────────────────────────────────────────

interface PinProps {
  waypoint: Waypoint;
  index: number;
  x: number;
  y: number;
  started: boolean;
  isActive: boolean;
  pulseKey: number;
  onClick: (index: number) => void;
  pinRef: (el: HTMLDivElement | null) => void;
}

function Pin({ waypoint, index, x, y, started, isActive, pulseKey, onClick, pinRef }: PinProps) {
  const delay = getPinDelay(index);
  const { isDarkMode } = useDarkMode();
  return (
    <div
      ref={pinRef}
      className="expedition-pin"
      style={{
        position: 'absolute',
        left: x,
        top: y - PIN_HEAD_CENTER_OFFSET,
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        opacity: started ? undefined : 0,
        animation: started ? `pinDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both` : 'none',
        zIndex: isActive ? 5 : 3,
      }}
      onClick={() => onClick(index)}
      role="button"
      tabIndex={0}
      aria-label={`${waypoint.label} — ${waypoint.sublabel}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(index);
      }}
    >
      <div style={{ position: 'relative', width: 26, height: 26 }}>
        {isActive && (
          <span
            key={pulseKey}
            className="pin-pulse"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${waypoint.color}`,
              animation: 'pinPulse 0.6s ease-out 3',
            }}
          />
        )}
        <div
          className="pin-head"
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: waypoint.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s ease',
          }}
        >
          <WaypointGlyph icon={waypoint.icon} color={PAPER} />
        </div>
      </div>
      <div style={{ width: 2, height: PIN_NEEDLE_HEIGHT, background: waypoint.color }} />
      <div style={{ marginTop: 4, textAlign: 'center', maxWidth: 104 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 600, color: isDarkMode ? 'rgba(255,255,255,0.9)' : INK, lineHeight: 1.25 }}>
          {waypoint.label}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, fontStyle: 'italic', color: isDarkMode ? 'rgba(255,255,255,0.6)' : INK_LIGHT, marginTop: 2 }}>
          {waypoint.sublabel}
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING INFO CARD (portal-based, fixed positioning) ───────────────────

interface ActiveCardState {
  waypoint: Waypoint;
  pinRect: DOMRect;
  isMobile: boolean;
}

function FloatingInfoCard({ state, onClose }: { state: ActiveCardState; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth = state.isMobile ? 200 : 250;
  const viewportWidth = window.innerWidth;

  let left = state.pinRect.left + state.pinRect.width / 2;
  const top = state.pinRect.top - 12;

  if (left - cardWidth / 2 < 8) left = cardWidth / 2 + 8;
  if (left + cardWidth / 2 > viewportWidth - 8) left = viewportWidth - cardWidth / 2 - 8;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left,
        top,
        width: cardWidth,
        transform: 'translate(-50%, -100%)',
        background: '#ffffff',
        border: `1px solid ${withAlpha(PENCIL, 0.6)}`,
        borderRadius: 4,
        padding: '10px 12px 12px',
        boxShadow: '0 10px 30px rgba(26,18,8,0.18)',
        zIndex: 9999,
        maxHeight: 220,
        overflowY: 'auto',
        pointerEvents: 'auto',
      }}
    >
      {/* Caret arrow pointing down */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          width: 10,
          height: 10,
          background: '#fff',
          borderRight: `1px solid ${PENCIL}`,
          borderBottom: `1px solid ${PENCIL}`,
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      />
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: INK_FAINT, letterSpacing: '0.04em', marginBottom: 5 }}>
        {formatCoordinate(state.waypoint.lat, state.waypoint.lng)}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 11, lineHeight: 1.55, color: INK }}>
        {state.waypoint.bio}
      </div>
    </div>,
    document.body
  );
}

// ─── EXPLORER CHARACTER ──────────────────────────────────────────────────────

interface ExplorerCharacterProps {
  leftLegRotation: number;
  rightLegRotation: number;
  isMoving: boolean;
}

function ExplorerCharacter({ leftLegRotation, rightLegRotation, isMoving }: ExplorerCharacterProps) {
  return (
    <svg width="44" height="52" viewBox="0 0 44 52" fill="none"
         style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))' }}>
      {/* Idle bounce indicator */}
      {!isMoving && (
        <path d="M17,1 L21,-3 L25,1 Z" fill="#A52A2A" className="explorer-idle-arrow" />
      )}
      {/* Backpack */}
      <rect x="5" y="20" width="10" height="15" rx="2" fill="#506141" stroke="#333f26" strokeWidth="1.5"/>
      <rect x="6" y="24" width="8" height="4" fill="#a3b899"/>
      {/* Left leg */}
      <g style={{ transform: `rotate(${leftLegRotation}deg)`, transformOrigin: '16px 34px' }}>
        <line x1="16" y1="34" x2="16" y2="43" stroke="#5c4033" strokeWidth="3" strokeLinecap="round"/>
        <path d="M14,43 L20,43 L20,46 L13,46 Z" fill="#4a2c11"/>
      </g>
      {/* Right leg */}
      <g style={{ transform: `rotate(${rightLegRotation}deg)`, transformOrigin: '26px 34px' }}>
        <line x1="26" y1="34" x2="26" y2="43" stroke="#5c4033" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24,43 L30,43 L30,46 L23,46 Z" fill="#4a2c11"/>
      </g>
      {/* Body */}
      <rect x="12" y="21" width="18" height="15" rx="4" fill="#d4c5a1" stroke="#8c7755" strokeWidth="1.5"/>
      <circle cx="16" cy="26" r="1.5" fill="#a17d45"/>
      <circle cx="26" cy="26" r="1.5" fill="#a17d45"/>
      {/* Head */}
      <rect x="18" y="18" width="6" height="4" fill="#fbd1a2"/>
      <circle cx="21" cy="15" r="7" fill="#fbd1a2" stroke="#d5a069" strokeWidth="1"/>
      <circle cx="18.5" cy="14" r="1" fill="#333"/>
      <circle cx="23.5" cy="14" r="1" fill="#333"/>
      <path d="M19,17 Q21,19 23,17" stroke="#333" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Hat */}
      <path d="M11,12 C11,7 31,7 31,12 Z" fill="#e8dac0" stroke="#b09c7a" strokeWidth="1"/>
      <rect x="12.5" y="10.5" width="17" height="1.5" fill="#A52A2A"/>
      <path d="M7,13 Q21,10 35,13 Q37,15 35,15 Q21,12 7,15 Q5,15 7,13 Z" fill="#dfcaad" stroke="#9e8a64" strokeWidth="1"/>
    </svg>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function ExpeditionMap() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [started, setStarted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCard, setActiveCard] = useState<ActiveCardState | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [walkAnimationTime, setWalkAnimationTime] = useState(0);
  const targetProgressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isFlippedRef = useRef(false);

  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const minGap = isMobile ? MIN_GAP_MOBILE : MIN_GAP_DESKTOP;
  const sectionHeight = isMobile ? SECTION_HEIGHT_MOBILE : SECTION_HEIGHT_DESKTOP;

  const { positions: rawPositions, trackWidth } = useMemo(
    () => computeLayout(viewportWidth, WAYPOINTS.length, minGap, sectionHeight),
    [viewportWidth, minGap, sectionHeight],
  );
  // Single source of truth for both pin markers and trail endpoints — the only
  // per-waypoint adjustment is the shared horizontal nudge, so the trail always
  // passes through the pins regardless of viewport width.
  const positions = useMemo(
    () => rawPositions.map((p, i) => ({
      x: p.x + (PIN_X_OFFSETS[i] ?? 0),
      y: p.y,
    })),
    [rawPositions],
  );
  const bezierSegments = useMemo(
    () => buildBezierSegments(positions),
    [positions],
  );
  const needsScroll = trackWidth > viewportWidth;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.intersectionRatio > 0.15);
        if (entry.intersectionRatio >= 0.3 && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          setStarted(true);
        }
      },
      { threshold: [0, 0.15, 0.3, 0.8] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrapper = trackWrapperRef.current;
    if (!wrapper) return;
    const handleScroll = () => setHasScrolled(true);
    wrapper.addEventListener('scroll', handleScroll, { passive: true });
    return () => wrapper.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePinClick = useCallback((index: number) => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setActiveIndex(index);

    const cardAlreadyShowing = activeIndex === index && activeCard !== null;
    if (!cardAlreadyShowing) {
      setPulseKey((k) => k + 1);
      const pinEl = pinRefs.current[index];
      if (pinEl) {
        setActiveCard({ waypoint: WAYPOINTS[index], pinRect: pinEl.getBoundingClientRect(), isMobile });
      }
      const wp = WAYPOINTS[index];
      window.dispatchEvent(
        new CustomEvent('expedition:zoomToWaypoint', {
          detail: { lat: wp.lat, lng: wp.lng, label: wp.label, index },
        }),
      );
    } else {
      hideTimerRef.current = window.setTimeout(() => setActiveCard(null), 250);
    }
  }, [activeIndex, activeCard, isMobile]);

  useEffect(() => () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
  }, []);

  // Explorer rAF animation — moves currentProgress toward activeIndex
  useEffect(() => {
    targetProgressRef.current = activeIndex;

    const animate = () => {
      setCurrentProgress((prev) => {
        const target = targetProgressRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.02) return target;
        setWalkAnimationTime((t) => t + 0.12);
        return prev + (diff > 0 ? 0.018 : -0.018);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeIndex]);

  // Flip direction
  useEffect(() => {
    const diff = activeIndex - currentProgress;
    if (Math.abs(diff) > 0.05) isFlippedRef.current = diff < 0;
  }, [activeIndex, currentProgress]);

  const sectionStyle: React.CSSProperties = {
    position: 'relative',
    left: '50%',
    width: '100vw',
    transform: 'translateX(-50%)',
    height: sectionHeight,
    background: isDarkMode ? 'rgba(10, 8, 4, 0.55)' : PAPER,
    overflow: 'visible',
    fontFamily: FONT_BODY,
    transition: 'background 0.4s ease',
    zIndex: 10, // above About section decorative overlays (tropics z:5, greenRocks z:6)
    isolation: 'isolate',
  };

  const isMoving = Math.abs(currentProgress - activeIndex) > 0.01;
  const leftLegRotation  = isMoving ? Math.sin(walkAnimationTime * 1.8) * 18 : 0;
  const rightLegRotation = isMoving ? Math.cos(walkAnimationTime * 1.8) * 18 : 0;
  const bobbingOffset    = isMoving ? Math.abs(Math.sin(walkAnimationTime * 2.0)) * 4 : 0;
  const explorerCoords   = getExplorerPosition(currentProgress, bezierSegments);

  return (
    <section ref={sectionRef} style={sectionStyle} aria-label="Expedition route">
      <style>{`
        @keyframes pinDrop {
          0%   { transform: translateX(-50%) translateY(-24px) scale(0.8); opacity: 0; }
          60%  { transform: translateX(-50%) translateY(3px) scale(1.05); opacity: 1; }
          80%  { transform: translateX(-50%) translateY(-2px) scale(0.98); }
          100% { transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes pinPulse {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2.3); opacity: 0; }
        }
        @keyframes explorerIdleBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .explorer-idle-arrow { animation: explorerIdleBounce 0.9s ease-in-out infinite; }
        .expedition-pin:hover .pin-head { transform: scale(1.08); }
        .expedition-track::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Cartographic paper grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.3)' : PENCIL} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? 'rgba(255,255,255,0.3)' : PENCIL} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />
      {/* Ruled midline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: sectionHeight / 2,
          height: 1,
          background: isDarkMode ? 'rgba(255,255,255,0.5)' : PENCIL,
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={trackWrapperRef}
        className="expedition-track"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflowX: needsScroll ? 'auto' : 'hidden',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ position: 'relative', width: trackWidth, height: sectionHeight, margin: needsScroll ? undefined : '0 auto' }}>
          <svg
            width={trackWidth}
            height={sectionHeight}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
          >
            {WAYPOINTS.slice(1).map((wp, idx) => (
              <RoutePath
                key={wp.id}
                d={bezierSegmentPath(bezierSegments[idx])}
                color={activeIndex >= idx + 1 ? wp.color : PENCIL}
                drawn={started}
                delay={getRouteStart(idx)}
              />
            ))}
          </svg>

          {/* Explorer character — follows cubic Bezier path via rAF */}
          {started && (
            <div
              style={{
                position: 'absolute',
                left: explorerCoords.x - 4,
                top: explorerCoords.y - EXPLORER_FOOT_FROM_CENTER - bobbingOffset,
                transform: `translate(-50%, -50%)${isFlippedRef.current ? ' scaleX(-1)' : ''}`,
                pointerEvents: 'none',
                zIndex: 4,
                transition: 'transform 0.15s ease',
              }}
            >
              <ExplorerCharacter
                leftLegRotation={leftLegRotation}
                rightLegRotation={rightLegRotation}
                isMoving={isMoving}
              />
            </div>
          )}

          {WAYPOINTS.map((wp, i) => (
            <Pin
              key={wp.id}
              waypoint={wp}
              index={i}
              x={positions[i].x}
              y={positions[i].y}
              started={started}
              isActive={activeIndex === i}
              pulseKey={pulseKey}
              onClick={handlePinClick}
              pinRef={(el) => { pinRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>

      {activeCard && (
        <FloatingInfoCard state={activeCard} onClose={() => { setActiveCard(null); }} />
      )}

      {needsScroll && (
        <div
          style={{
            position: 'absolute',
            right: 16,
            bottom: 12,
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: isDarkMode ? 'rgba(255,255,255,0.5)' : INK_FAINT,
            letterSpacing: '0.05em',
            borderBottom: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.3)' : PENCIL}`,
            opacity: hasScrolled ? 0 : 1,
            transition: 'opacity 600ms ease',
            pointerEvents: 'none',
          }}
        >
          scroll →
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: isDarkMode ? 'rgba(255,255,255,0.6)' : INK_FAINT,
          letterSpacing: '0.02em',
          opacity: isInView ? 1 : 0,
          transition: 'opacity 400ms ease',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      >
        Currently: {WAYPOINTS[activeIndex]?.sublabel ?? WAYPOINTS[0].sublabel}
      </div>
    </section>
  );
}
