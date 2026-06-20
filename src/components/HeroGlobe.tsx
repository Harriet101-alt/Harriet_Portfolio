import { useCallback, useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { WAYPOINTS, type Waypoint } from '../data/waypoints';
import { useDarkMode } from '../contexts/DarkModeContext';

const EARTH_TEXTURE = '/globe/earth-blue-marble.jpg';
const EARTH_BUMP    = '/globe/earth-topology.png';

const FONT_MONO = '"Courier Prime", "Courier New", monospace';
const FONT_BODY = 'Georgia, serif';

function formatCoordinate(lat: number, lng: number) {
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = Math.round((Math.abs(lat) - latDeg) * 60);
  const lngDeg = Math.floor(Math.abs(lng));
  const lngMin = Math.round((Math.abs(lng) - lngDeg) * 60);
  return `${latDeg}°${latMin}′${lat >= 0 ? 'N' : 'S'}  ${lngDeg}°${lngMin}′${lng >= 0 ? 'E' : 'W'}`;
}

const GLOBE_POINTS = WAYPOINTS.map((wp) => ({
  id: wp.id,
  lat: wp.lat,
  lng: wp.lng,
  color: wp.color,
  label: wp.label,
  size: 0.45,
}));

export default function HeroGlobe({ compact = false }: { compact?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const globeEl   = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const timersRef = useRef<number[]>([]);
  const idleTimer = useRef<number | null>(null);
  const { isDarkMode } = useDarkMode();

  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [cardVisible, setCardVisible] = useState(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Smoothly fly to a waypoint
  const flyTo = useCallback((wp: Waypoint) => {
    const globe = globeInstance.current;
    if (!globe) return;
    clearTimers();

    const controls = globe.controls();
    controls.autoRotate = false;

    const cur = globe.pointOfView();
    globe.pointOfView({ lat: cur.lat, lng: cur.lng, altitude: 2.2 }, 600);

    timersRef.current.push(
      window.setTimeout(() => {
        globeInstance.current?.pointOfView({ lat: wp.lat, lng: wp.lng, altitude: 2.2 }, 1000);
      }, 600),
      window.setTimeout(() => {
        globeInstance.current?.pointOfView({ lat: wp.lat, lng: wp.lng, altitude: wp.altitude }, 1200);
      }, 1600),
    );
  }, [clearTimers]);

  const resumeIdle = useCallback(() => {
    const globe = globeInstance.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
  }, []);

  // Select / deselect a waypoint
  const selectWaypoint = useCallback((wp: Waypoint | null) => {
    if (!wp) {
      setCardVisible(false);
      timersRef.current.push(window.setTimeout(() => setActiveWaypoint(null), 250));
      resumeIdle();
      return;
    }
    if (activeWaypoint?.id === wp.id) {
      selectWaypoint(null);
      return;
    }
    setCardVisible(false);
    timersRef.current.push(
      window.setTimeout(() => {
        setActiveWaypoint(wp);
        setCardVisible(true);
      }, 200),
    );
    flyTo(wp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWaypoint, flyTo, resumeIdle]);

  // Init globe once, size it properly after first render
  useEffect(() => {
    if (!globeEl.current) return;

    const globe = Globe()(globeEl.current);
    globeInstance.current = globe;

    globe
      .globeImageUrl(EARTH_TEXTURE)
      .bumpImageUrl(EARTH_BUMP)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('rgba(147, 210, 255, 0.3)')
      .atmosphereAltitude(compact ? 0.18 : 0.15)
      .pointsData(compact ? [] : GLOBE_POINTS)
      .pointAltitude((p: { size: number }) => p.size)
      .pointRadius(0.4)
      .pointColor((p: { color: string }) => p.color)
      .pointLabel(() => '');

    // Ensure WebGL renderer is fully transparent
    (globe.renderer() as { setClearColor: (color: number, alpha: number) => void })
      .setClearColor(0x000000, 0);

    if (!compact) {
      globe.onPointClick((point: { id: string }) => {
        const wp = WAYPOINTS.find((w) => w.id === point.id) ?? null;
        setActiveWaypoint((prev) => {
          if (prev?.id === wp?.id) {
            setCardVisible(false);
            setTimeout(() => setActiveWaypoint(null), 250);
            resumeIdle();
            return prev;
          }
          if (wp) {
            setCardVisible(false);
            setTimeout(() => {
              setActiveWaypoint(wp);
              setCardVisible(true);
            }, 200);
            flyTo(wp);
          }
          return prev;
        });
      });
    }

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = compact ? 0.6 : 0.5;
    controls.enableDamping = !compact;
    controls.dampingFactor = 0.1;

    if (compact) {
      controls.enableZoom   = false;
      controls.enableRotate = false;
      controls.enablePan    = false;
    } else {
      // Re-enable idle spin some seconds after user stops dragging
      controls.addEventListener('end', () => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => {
          if (globeInstance.current) {
            globeInstance.current.controls().autoRotate = true;
            globeInstance.current.controls().autoRotateSpeed = 0.5;
          }
        }, 3000);
      });
    }

    // Size the globe correctly after layout paint
    const setSize = () => {
      if (!globeEl.current) return;
      const w = globeEl.current.clientWidth;
      if (w > 0) {
        globe.width(w).height(w);
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(setSize));

    const ro = new ResizeObserver(setSize);
    ro.observe(globeEl.current);

    return () => {
      ro.disconnect();
      clearTimers();
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      try { globe._destructor(); } catch { /* ignore */ }
      globeInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight active point when selection changes
  useEffect(() => {
    globeInstance.current
      ?.pointRadius((p: any) => (activeWaypoint?.id === p.id ? 0.58 : 0.4))
      ?.pointAltitude((p: any) => (activeWaypoint?.id === p.id ? 0.7 : p.size));
  }, [activeWaypoint]);

  const cardBg     = isDarkMode ? 'rgba(16,23,39,0.97)' : 'rgba(255,255,255,0.97)';
  const cardText   = isDarkMode ? '#e8e0d0' : '#1a1208';
  const cardSub    = isDarkMode ? '#a09278' : '#5c4f3a';
  const cardBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(90,78,58,0.25)';

  // Compact mode: just the globe sphere — container handles all sticker styling
  if (compact) {
    return <div ref={globeEl} style={{ width: '100%', height: '100%', cursor: 'default' }} />;
  }

  return (
    <div ref={wrapperRef} style={{ width: '100%', maxWidth: '440px' }}>
      {/* Globe sphere */}
      <div
        ref={globeEl}
        style={{ width: '100%', aspectRatio: '1 / 1', cursor: 'grab' }}
      />

      {/* Legend buttons — hidden in compact/sticker mode */}
      {!compact && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: '10px', paddingLeft: '2px' }}>
          {WAYPOINTS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => selectWaypoint(wp)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0',
                fontFamily: FONT_MONO, fontSize: '10px',
                color: activeWaypoint?.id === wp.id ? wp.color : cardSub,
                fontWeight: activeWaypoint?.id === wp.id ? 700 : 400,
                transition: 'color 0.2s',
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: wp.color, flexShrink: 0, display: 'inline-block',
              }} />
              {wp.label}
            </button>
          ))}
        </div>
      )}

      {/* Info card — hidden in compact/sticker mode */}
      {!compact && (
        <div style={{
          marginTop: '12px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '6px',
          padding: cardVisible && activeWaypoint ? '14px 16px 16px' : '0 16px',
          maxHeight: cardVisible && activeWaypoint ? '320px' : '0',
          overflow: 'hidden',
          opacity: cardVisible && activeWaypoint ? 1 : 0,
          transform: cardVisible && activeWaypoint ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 250ms ease, transform 250ms ease, max-height 300ms ease, padding 300ms ease',
          pointerEvents: cardVisible && activeWaypoint ? 'auto' : 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {activeWaypoint && (
            <>
              <div style={{ fontFamily: FONT_MONO, fontSize: '9px', color: cardSub, letterSpacing: '0.05em', marginBottom: '6px' }}>
                {formatCoordinate(activeWaypoint.lat, activeWaypoint.lng)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: activeWaypoint.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 600, color: cardText }}>
                  {activeWaypoint.label}
                </span>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: '10px', color: activeWaypoint.color, marginBottom: '10px', marginLeft: '18px' }}>
                {activeWaypoint.sublabel}
              </div>
              <p style={{ fontFamily: FONT_BODY, fontSize: '12px', lineHeight: 1.65, color: cardText, margin: 0 }}>
                {activeWaypoint.bio}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
