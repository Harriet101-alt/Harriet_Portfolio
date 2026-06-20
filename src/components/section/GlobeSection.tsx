import { useCallback, useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { WAYPOINTS, type Waypoint } from '../../data/waypoints';

const EARTH_TEXTURE_URL = '/globe/earth-blue-marble.jpg';
const EARTH_BUMP_URL    = '/globe/earth-topology.png';

const LIVERPOOL = WAYPOINTS[0];

const LIVERPOOL_POINT = {
  lat: LIVERPOOL.lat,
  lng: LIVERPOOL.lng,
  size: 0.6,
  color: '#ffffff',
  label: LIVERPOOL.label,
};

function formatCoords(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

// ─── EXPLORER CHARACTER (adapted from ExpeditionMap, with khaki outfit) ───────

function ExplorerWithSign({
  signClicked,
  onExplorerClick,
}: {
  signClicked: boolean;
  onExplorerClick: () => void;
}) {
  return (
    <g
      onClick={onExplorerClick}
      style={{ cursor: signClicked ? 'default' : 'pointer' }}
    >
      {/* ── Explorer body ── */}
      <g style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.35))' }}>
        {/* Body */}
        <ellipse cx="16" cy="28" rx="8" ry="10" fill="#C2A878" />
        {/* Head */}
        <circle cx="16" cy="14" r="9" fill="#F5D5A8" />
        {/* Pith helmet */}
        <ellipse cx="16" cy="8" rx="11" ry="4" fill="#C8A84B" />
        <rect x="8" y="5" width="16" height="5" rx="2" fill="#D4B254" />
        <rect x="8" y="8" width="16" height="2" fill="#A0832A" opacity="0.5" />
        {/* Eyes */}
        <circle cx="12" cy="14" r="1.5" fill="#3D2008" />
        <circle cx="20" cy="14" r="1.5" fill="#3D2008" />
        <circle cx="12.7" cy="13.3" r="0.5" fill="white" />
        <circle cx="20.7" cy="13.3" r="0.5" fill="white" />
        {/* Smile */}
        <path d="M 13 17 Q 16 19 19 17" stroke="#A0622A" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Backpack */}
        <rect x="22" y="20" width="7" height="10" rx="2" fill="#8B6914" />
        <rect x="23" y="22" width="5" height="3" rx="1" fill="#6B4F10" opacity="0.6" />
        {/* Khaki shirt */}
        <rect x="9" y="20" width="14" height="12" rx="3" fill="#C2A878" />
        {/* Cargo shorts */}
        <rect x="9" y="30" width="14" height="9" rx="2" fill="#8B7355" />
        <rect x="10" y="32" width="5" height="4" rx="1" fill="#7A6248" opacity="0.6" />
        {/* Legs */}
        <line x1="12" y1="38" x2="10" y2="50" stroke="#5C3317" strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="38" x2="22" y2="50" stroke="#5C3317" strokeWidth="3" strokeLinecap="round" />
        {/* Shoes */}
        <ellipse cx="10" cy="50" rx="3" ry="2" fill="#3D2008" />
        <ellipse cx="22" cy="50" rx="3" ry="2" fill="#3D2008" />
        {/* Left arm */}
        <line x1="8" y1="24" x2="2" y2="32" stroke="#E8C49A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Map/scroll under left arm */}
        <rect x="-3" y="29" width="9" height="6" rx="1" fill="white" opacity="0.92" />
        <line x1="-3" y1="32" x2="6" y2="32" stroke="#C8A860" strokeWidth="0.6" />
        <rect x="-3" y="29" width="2.5" height="6" rx="0.5" fill="#D4B870" opacity="0.7" />
        {/* Right arm — wave animation triggers on click */}
        <line
          x1="24" y1="24" x2="30" y2="32"
          stroke="#E8C49A" strokeWidth="2.5" strokeLinecap="round"
          style={{
            animation: signClicked ? 'globeExplorerWave 0.4s ease-in-out forwards' : undefined,
            transformOrigin: '24px 24px',
          }}
        />
      </g>

      {/* ── Sign (fades out after click) ── */}
      {!signClicked && (
        <g
          transform="translate(36, 8)"
          style={{ animation: 'globeSignSway 2.5s ease-in-out infinite', transformOrigin: '18px 28px' }}
        >
          {/* Post */}
          <rect x="16" y="26" width="4" height="22" rx="1" fill="#5C3317" />
          {/* Sign plank */}
          <rect x="1" y="12" width="34" height="18" rx="3" fill="#8B6914" stroke="#5C3317" strokeWidth="2" />
          {/* Grain lines */}
          <line x1="1" y1="18" x2="35" y2="18" stroke="#7A5F10" strokeWidth="0.6" opacity="0.5" />
          <line x1="1" y1="23" x2="35" y2="23" stroke="#7A5F10" strokeWidth="0.6" opacity="0.5" />
          <text
            x="18" y="25"
            textAnchor="middle"
            fill="#3D1F00"
            fontSize="7"
            fontFamily="Georgia, 'Playfair Display', serif"
            fontWeight="bold"
          >
            Click me!
          </text>
        </g>
      )}
    </g>
  );
}

interface ZoomToWaypointDetail {
  lat: number;
  lng: number;
  label: string;
  index: number;
}

export default function GlobeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<ReturnType<typeof Globe> | null>(null);
  const hasZoomed = useRef(false);
  const timersRef = useRef<number[]>([]);
  const visitedRef = useRef<Waypoint[]>([]);
  const manualFlightActive = useRef(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [overlayLabel, setOverlayLabel] = useState(LIVERPOOL.label === 'Liverpool, UK' ? 'Liverpool, United Kingdom' : LIVERPOOL.label);
  const [overlayCoords, setOverlayCoords] = useState(formatCoords(LIVERPOOL.lat, LIVERPOOL.lng));
  const [signClicked, setSignClicked] = useState(false);
  const [showBubble, setShowBubble]   = useState(false);
  const bubbleTimerRef = useRef<number | null>(null);

  const handleExplorerClick = () => {
    if (signClicked) return;
    setSignClicked(true);
    setShowBubble(true);
    bubbleTimerRef.current = window.setTimeout(() => setShowBubble(false), 5000);
  };

  // Dismiss bubble on click elsewhere
  useEffect(() => {
    if (!showBubble) return;
    const dismiss = () => setShowBubble(false);
    const timer = window.setTimeout(() => {
      document.addEventListener('click', dismiss, { once: true });
    }, 120);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', dismiss);
    };
  }, [showBubble]);

  useEffect(() => {
    return () => { if (bubbleTimerRef.current !== null) window.clearTimeout(bubbleTimerRef.current); };
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const setIdleSpin = useCallback(() => {
    const globe = globeInstance.current;
    if (!globe || manualFlightActive.current) return;

    clearTimers();
    setShowOverlay(false);
    globe.pointsData([]);
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1200);

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
  }, [clearTimers]);

  const runZoomSequence = useCallback(() => {
    const globe = globeInstance.current;
    if (!globe || hasZoomed.current || isMobile) return;

    hasZoomed.current = true;
    clearTimers();
    setShowOverlay(false);
    globe.pointsData([]);

    const controls = globe.controls();
    controls.autoRotate = false;

    globe.pointOfView({ ...LIVERPOOL, altitude: 2.5 }, 1800);

    timersRef.current.push(
      window.setTimeout(() => {
        globeInstance.current?.pointOfView({ ...LIVERPOOL, altitude: 0.35 }, 2200);
      }, 1800),
      window.setTimeout(() => {
        globeInstance.current?.pointsData([LIVERPOOL_POINT]);
        visitedRef.current = [LIVERPOOL];
        setOverlayLabel('Liverpool, United Kingdom');
        setOverlayCoords(formatCoords(LIVERPOOL.lat, LIVERPOOL.lng));
        setShowOverlay(true);
      }, 4000),
    );
  }, [clearTimers, isMobile]);

  const flyToWaypoint = useCallback((waypoint: Waypoint) => {
    const globe = globeInstance.current;
    if (!globe) return;

    clearTimers();
    manualFlightActive.current = true;
    setShowOverlay(false);

    const controls = globe.controls();
    controls.autoRotate = false;

    const currentPov = globe.pointOfView();
    globe.pointOfView({ lat: currentPov.lat, lng: currentPov.lng, altitude: 2.0 }, 800);

    timersRef.current.push(
      window.setTimeout(() => {
        globeInstance.current?.pointOfView({ lat: waypoint.lat, lng: waypoint.lng, altitude: 2.0 }, 1200);
      }, 800),
      window.setTimeout(() => {
        globeInstance.current?.pointOfView({ lat: waypoint.lat, lng: waypoint.lng, altitude: waypoint.altitude }, 1800);
      }, 2000),
      window.setTimeout(() => {
        const alreadyVisited = visitedRef.current.some((w) => w.id === waypoint.id);
        if (!alreadyVisited) visitedRef.current = [...visitedRef.current, waypoint];

        const dots = visitedRef.current
          .filter((w) => w.id !== waypoint.id)
          .map((w) => ({ lat: w.lat, lng: w.lng, size: 0.3, color: 'rgba(255,255,255,0.4)', label: w.label }));
        const activePoint = { lat: waypoint.lat, lng: waypoint.lng, size: 0.6, color: waypoint.color, label: waypoint.label };
        globeInstance.current?.pointsData([...dots, activePoint]);

        if (visitedRef.current.length >= 2) {
          const prev = visitedRef.current[visitedRef.current.length - 2];
          (globeInstance.current as any)
            ?.arcsData([{ startLat: prev.lat, startLng: prev.lng, endLat: waypoint.lat, endLng: waypoint.lng, color: [prev.color, waypoint.color] }])
            .arcStroke(0.4)
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(1500)
            .arcsTransitionDuration(800);
        }

        setOverlayLabel(waypoint.label);
        setOverlayCoords(formatCoords(waypoint.lat, waypoint.lng));
        setShowOverlay(true);
        manualFlightActive.current = false;
      }, 3800),
    );
  }, [clearTimers]);

  useEffect(() => {
    if (!globeEl.current) return;

    const globe = Globe()(globeEl.current);
    globeInstance.current = globe;

    globe
      .globeImageUrl(EARTH_TEXTURE_URL)
      .bumpImageUrl(EARTH_BUMP_URL)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true);

    // Ensure the WebGL renderer is fully transparent (no opaque clear pass)
    (globe.renderer() as { setClearColor: (color: number, alpha: number) => void }).setClearColor(0x000000, 0);

    globe
      .atmosphereColor('rgba(147, 210, 255, 0.3)')
      .atmosphereAltitude(0.15)
      .pointsData([])
      .pointAltitude((point: { size: number }) => point.size)
      .pointRadius(0.35)
      .pointColor((point: { color: string }) => point.color)
      .pointLabel((point: { label: string }) => point.label);

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    const resizeGlobe = () => {
      if (!globeEl.current) return;
      globe
        .width(globeEl.current.clientWidth)
        .height(globeEl.current.clientHeight);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      resizeGlobe();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimers();
      globe._destructor();
      globeInstance.current = null;
    };
  }, [clearTimers]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isMobile) {
          setIdleSpin();
          return;
        }

        if (entry.intersectionRatio >= 0.8) {
          runZoomSequence();
          return;
        }

        setIdleSpin();
      },
      { threshold: [0, 0.8, 1] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile, runZoomSequence, setIdleSpin]);

  useEffect(() => {
    const handleZoomToWaypoint = (e: Event) => {
      const detail = (e as CustomEvent<ZoomToWaypointDetail>).detail;
      const waypoint = WAYPOINTS[detail.index];
      if (!waypoint || !globeInstance.current) return;
      flyToWaypoint(waypoint);
    };

    window.addEventListener('expedition:zoomToWaypoint', handleZoomToWaypoint);
    return () => window.removeEventListener('expedition:zoomToWaypoint', handleZoomToWaypoint);
  }, [flyToWaypoint]);

  return (
    <>
      {/* Animation keyframes for explorer sign and wave */}
      <style>{`
        @keyframes globeSignSway {
          0%, 100% { transform: rotate(-2deg); }
          50%       { transform: rotate(2deg); }
        }
        @keyframes globeExplorerWave {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(-35deg); }
          75%  { transform: rotate(-35deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes globeBubbleIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <section
        ref={sectionRef}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: isMobile ? '50vh' : '70vh',
          height: isMobile ? '50vh' : '70vh',
          background: 'transparent',
          overflow: 'hidden',
        }}
        aria-label="Global location section"
      >
        <div
          ref={globeEl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Coordinate overlay */}
        <div
          style={{
            position: 'absolute',
            left: '24px',
            bottom: '20px',
            opacity: showOverlay ? 1 : 0,
            transition: 'opacity 600ms ease',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: '"Courier Prime", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '0.04em',
            }}
          >
            {overlayCoords}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'inherit',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            {overlayLabel}
          </div>
        </div>

        {/* Explorer + sign overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: isMobile ? '12px' : '32px',
            zIndex: 3,
          }}
        >
          <svg
            width="120" height="72"
            viewBox="0 0 120 72"
            overflow="visible"
          >
            <g transform="translate(4, 4) scale(1.25)">
              <ExplorerWithSign
                signClicked={signClicked}
                onExplorerClick={handleExplorerClick}
              />
            </g>
          </svg>
        </div>

        {/* Speech bubble */}
        {showBubble && (
          <div
            style={{
              position: 'absolute',
              bottom: '110px',
              right: isMobile ? '8px' : '28px',
              background: 'white',
              borderRadius: '12px',
              padding: '12px 16px',
              maxWidth: '220px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              fontSize: '13px',
              color: '#1a1208',
              fontFamily: '"Lora", Georgia, serif',
              lineHeight: 1.55,
              zIndex: 4,
              animation: 'globeBubbleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            Hi! I'm your guide. Click a glowing dot on the globe to explore my travels around the world!
            {/* Triangle pointer */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '36px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
            }} />
          </div>
        )}
      </section>
    </>
  );
}
