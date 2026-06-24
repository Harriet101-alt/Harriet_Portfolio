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
const MOBILE_BREAKPOINT = 760;
const INSET = 80;
const MIN_GAP_DESKTOP = 160;
const MIN_GAP_MOBILE = 124;
const WAVE_AMPLITUDE_DESKTOP = 32;
const WAVE_AMPLITUDE_MOBILE = 22;

const ROUTE_DURATION = 900;
const ROUTE_STAGGER = 200;
const PIN_STAGGER = 180;

// Pin geometry — used to align SVG path endpoints with the physical pin needle bottom
const PIN_HEAD_HEIGHT = 26;       // matches pin-head div height
const PIN_NEEDLE_HEIGHT = 16;     // matches pin needle div height
const PIN_CONTAINER_OFFSET = 13;  // pin container top = y - PIN_CONTAINER_OFFSET
// Needle bottom relative to computed y: (y - 13) + 26 + 16 = y + 29
const PIN_NEEDLE_BOTTOM_OFFSET =
  -PIN_CONTAINER_OFFSET + PIN_HEAD_HEIGHT + PIN_NEEDLE_HEIGHT; // 29


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
  sectionHeight: number,
  amplitude: number,
  minGap: number,
): { positions: PinPosition[]; trackWidth: number } {
  const minimumRouteWidth = count > 1 ? INSET * 2 + (count - 1) * minGap : containerWidth;
  const trackWidth = Math.max(containerWidth, minimumRouteWidth);
  const usableWidth = Math.max(trackWidth - INSET * 2, 0);
  const gap = count > 1 ? usableWidth / (count - 1) : 0;
  const midY = sectionHeight / 2;
  const positions = Array.from({ length: count }, (_, i) => ({
    x: count === 1 ? trackWidth / 2 : INSET + i * gap,
    y: count === 1 ? midY : midY - amplitude * Math.cos((i * Math.PI) / (count - 1)),
  }));
  return { positions, trackWidth };
}

function routePathD(from: PinPosition, to: PinPosition) {
  const { p0, p1, cp1, cp2 } = routeSegment(from, to);
  return `M ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p1.x} ${p1.y}`;
}

function routeSegment(from: PinPosition, to: PinPosition) {
  const p0 = { x: from.x, y: from.y + PIN_NEEDLE_BOTTOM_OFFSET };
  const p1 = { x: to.x, y: to.y + PIN_NEEDLE_BOTTOM_OFFSET };
  const dx = p1.x - p0.x;
  const cp1 = { x: p0.x + dx * 0.4, y: p0.y };
  const cp2 = { x: p1.x - dx * 0.4, y: p1.y };
  return { p0, p1, cp1, cp2 };
}

function fullRoutePathD(positions: PinPosition[]) {
  if (positions.length < 2) return '';

  const start = routeSegment(positions[0], positions[1]).p0;
  const segments = positions.slice(1).map((to, i) => {
    const { p1, cp1, cp2 } = routeSegment(positions[i], to);
    return `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p1.x} ${p1.y}`;
  });

  return `M ${start.x} ${start.y} ${segments.join(' ')}`;
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
    if (ref.current) setLength(ref.current.getTotalLength());
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
      onTransitionEnd={() => {
        if (drawn) setRevealed(true);
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
        top: y - 13,
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
      <div style={{ width: 2, height: 16, background: waypoint.color }} />
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

function ExplorerCharacter() {
  return (
    <g style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))' }}>
      {/* Body */}
      <ellipse cx="16" cy="28" rx="8" ry="10" fill="#E8C49A"/>
      {/* Head */}
      <circle cx="16" cy="14" r="9" fill="#F5D5A8"/>
      {/* Hat (pith helmet) */}
      <ellipse cx="16" cy="8" rx="11" ry="4" fill="#C8A84B"/>
      <rect x="8" y="5" width="16" height="5" rx="2" fill="#D4B254"/>
      {/* Hat band */}
      <rect x="8" y="8" width="16" height="2" fill="#A0832A" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="12" cy="14" r="1.5" fill="#3D2008"/>
      <circle cx="20" cy="14" r="1.5" fill="#3D2008"/>
      {/* Eye shine */}
      <circle cx="12.7" cy="13.3" r="0.5" fill="white"/>
      <circle cx="20.7" cy="13.3" r="0.5" fill="white"/>
      {/* Smile */}
      <path d="M 13 17 Q 16 19 19 17" stroke="#A0622A" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Backpack */}
      <rect x="22" y="20" width="7" height="10" rx="2" fill="#8B6914"/>
      <rect x="23" y="22" width="5" height="3" rx="1" fill="#6B4F10" opacity="0.6"/>
      {/* Shirt */}
      <rect x="9" y="20" width="14" height="12" rx="3" fill="#8B9E6A"/>
      {/* Legs */}
      <line x1="12" y1="38" x2="10" y2="50" stroke="#5C3317" strokeWidth="3" strokeLinecap="round" className="explorer-leg-left"/>
      <line x1="20" y1="38" x2="22" y2="50" stroke="#5C3317" strokeWidth="3" strokeLinecap="round" className="explorer-leg-right"/>
      {/* Shoes */}
      <ellipse cx="10" cy="50" rx="3" ry="2" fill="#3D2008" className="explorer-leg-left"/>
      <ellipse cx="22" cy="50" rx="3" ry="2" fill="#3D2008" className="explorer-leg-right"/>
      {/* Arms */}
      <line x1="8" y1="24" x2="2" y2="32" stroke="#E8C49A" strokeWidth="2.5" strokeLinecap="round" className="explorer-arm-left"/>
      <line x1="24" y1="24" x2="30" y2="32" stroke="#E8C49A" strokeWidth="2.5" strokeLinecap="round" className="explorer-arm-right"/>
    </g>
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCardState | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const sectionHeight = isMobile ? SECTION_HEIGHT_MOBILE : SECTION_HEIGHT_DESKTOP;
  const waveAmplitude = isMobile ? WAVE_AMPLITUDE_MOBILE : WAVE_AMPLITUDE_DESKTOP;
  const minGap = isMobile ? MIN_GAP_MOBILE : MIN_GAP_DESKTOP;

  const { positions, trackWidth } = useMemo(
    () => computeLayout(viewportWidth, WAYPOINTS.length, sectionHeight, waveAmplitude, minGap),
    [viewportWidth, sectionHeight, waveAmplitude, minGap],
  );
  const needsScroll = trackWidth > viewportWidth;
  const currentWaypoint = activeIndex === null ? WAYPOINTS[0] : WAYPOINTS[activeIndex];

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

    const turningOn = activeIndex !== index;
    if (turningOn) {
      setActiveIndex(index);
      setPulseKey(Date.now()); // Restart pulse animation on re-click

      const pinEl = pinRefs.current[index];
      if (pinEl) {
        const rect = pinEl.getBoundingClientRect();
        setActiveCard({ waypoint: WAYPOINTS[index], pinRect: rect, isMobile });
      }

      const wp = WAYPOINTS[index];
      window.dispatchEvent(
        new CustomEvent('expedition:zoomToWaypoint', {
          detail: { lat: wp.lat, lng: wp.lng, label: wp.label, index },
        }),
      );
    } else {
      setActiveIndex(null);
      hideTimerRef.current = window.setTimeout(() => setActiveCard(null), 250);
    }
  }, [activeIndex, isMobile]);

  useEffect(() => () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
  }, []);

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
  };

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
        @keyframes explorerLegLeft {
          0%, 100% { transform-box: fill-box; transform-origin: top; transform: rotate(-20deg); }
          50%       { transform-box: fill-box; transform-origin: top; transform: rotate(20deg); }
        }
        @keyframes explorerLegRight {
          0%, 100% { transform-box: fill-box; transform-origin: top; transform: rotate(20deg); }
          50%       { transform-box: fill-box; transform-origin: top; transform: rotate(-20deg); }
        }
        @keyframes explorerArmLeft {
          0%, 100% { transform-box: fill-box; transform-origin: top; transform: rotate(20deg); }
          50%       { transform-box: fill-box; transform-origin: top; transform: rotate(-20deg); }
        }
        @keyframes explorerArmRight {
          0%, 100% { transform-box: fill-box; transform-origin: top; transform: rotate(-20deg); }
          50%       { transform-box: fill-box; transform-origin: top; transform: rotate(20deg); }
        }
        .explorer-leg-left  { animation: explorerLegLeft  0.4s ease-in-out infinite; }
        .explorer-leg-right { animation: explorerLegRight 0.4s ease-in-out infinite; }
        .explorer-arm-left  { animation: explorerArmLeft  0.4s ease-in-out infinite; }
        .explorer-arm-right { animation: explorerArmRight 0.4s ease-in-out infinite; }
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
        <div style={{ position: 'relative', width: trackWidth, height: '100%', margin: needsScroll ? undefined : '0 auto' }}>
          <svg
            width={trackWidth}
            height={sectionHeight}
            style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
          >
            {WAYPOINTS.slice(1).map((wp, idx) => (
              <RoutePath
                key={wp.id}
                d={routePathD(positions[idx], positions[idx + 1])}
                color={wp.color}
                drawn={started}
                delay={getRouteStart(idx)}
              />
            ))}

            {/* Hidden combined route for explorer animation */}
            {positions.length >= 2 && (
              <path
                id="expedition-full-route"
                d={fullRoutePathD(positions)}
                fill="none"
                stroke="none"
              />
            )}

            {/* Explorer character */}
            {positions.length >= 2 && started && (
              <g>
                <animateMotion
                  dur="12s"
                  repeatCount="indefinite"
                  rotate="0"
                >
                  <mpath href="#expedition-full-route" />
                </animateMotion>
                <g transform="translate(-16, -48)">
                  <ExplorerCharacter />
                </g>
              </g>
            )}
          </svg>

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
        <FloatingInfoCard state={activeCard} onClose={() => { setActiveIndex(null); setActiveCard(null); }} />
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
        Currently: {currentWaypoint.label} - {currentWaypoint.sublabel}
      </div>
    </section>
  );
}
