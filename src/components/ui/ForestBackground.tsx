/**
 * ForestBackground — 10-layer SVG + CSS parallax forest illustration.
 * Fixed, full-viewport, pointer-events: none — never blocks clicks.
 *
 * Layer z-index architecture:
 *   0  Sky gradient
 *   1  Light rays
 *   2  Cumulus clouds
 *   3  Distant tree silhouettes
 *   4  Willow trees
 *   5  Red oak foliage
 *   6  Ivy
 *   7  Bluebells
 *   8  Lilies
 *   9  Foreground grass
 */
import { useEffect, useRef } from 'react';

// ─── NIGHT-MODE COLOUR INTERPOLATION ─────────────────────────────────────────
// Light mode keeps every original value untouched. In dark mode each property
// lerps between a "dusk" endpoint (scroll depth d = 0) and a "deep-night"
// endpoint (d = 1). All endpoints are floored above pure black so body text
// stays legible at maximum scroll.

// Colour interpolation helpers for future dark-mode integration
// /** Linear interpolate two numbers. */
// function lerp(a: number, b: number, t: number): number {
//   return a + (b - a) * t;
// }

// Colour interpolation helpers for future dark-mode integration
// /** Parse "#RRGGBB" → [r,g,b]. */
// function hexToRgb(hex: string): [number, number, number] {
//   const h = hex.replace('#', '');
//   return [
//     parseInt(h.slice(0, 2), 16),
//     parseInt(h.slice(2, 4), 16),
//     parseInt(h.slice(4, 6), 16),
//   ];
// }

// /** Lerp between two "#RRGGBB" colours, returning an "rgb(...)" string. */
// function lerpHex(from: string, to: string, t: number): string {
//   const [r1, g1, b1] = hexToRgb(from);
//   const [r2, g2, b2] = hexToRgb(to);
//   return `rgb(${Math.round(lerp(r1, r2, t))}, ${Math.round(lerp(g1, g2, t))}, ${Math.round(lerp(b1, b2, t))})`;
// }

// Night sky-gradient stops: [duskHex, deepNightHex] at the original positions.
// (Kept for future dark-mode integration in JungleCanvas)
// const NIGHT_SKY_STOPS: { pos: string; dusk: string; night: string }[] = [
//   { pos: '0%',   dusk: '#2E4068', night: '#16203A' },
//   { pos: '34%',  dusk: '#3C4C72', night: '#1C2A48' },
//   { pos: '72%',  dusk: '#7A5A78', night: '#3A3656' },
//   { pos: '100%', dusk: '#C88B95', night: '#5C4A63' },
// ];

// function nightSkyGradient(d: number): string {
//   const stops = NIGHT_SKY_STOPS.map(s => `${lerpHex(s.dusk, s.night, d)} ${s.pos}`).join(', ');
//   return `linear-gradient(to bottom, ${stops})`;
// }

// ─── SHARED LAYER WRAPPER ────────────────────────────────────────────────────
interface LayerProps {
  zIndex: number;
  opacity: number;
  layerRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  willChangeTransform?: boolean;
  extraStyle?: React.CSSProperties;
}

function Layer({ zIndex, opacity, layerRef, children, willChangeTransform, extraStyle }: LayerProps) {
  return (
    <div
      ref={layerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        opacity,
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
        willChange: willChangeTransform ? 'transform' : undefined,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

// ─── LAYER 1: SKY ────────────────────────────────────────────────────────────
interface SkyLayerProps {
  layerRef: React.RefObject<HTMLDivElement | null>;
}

function SkyLayer({ layerRef }: SkyLayerProps) {
  return (
    <Layer zIndex={0} opacity={0.92} layerRef={layerRef}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, #87CEEB 0%, #ADE4F5 34%, #FDD5DF 72%, #FFF5F7 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 68% 24%, rgba(236, 73, 153, 0.2), transparent 28%), linear-gradient(120deg, rgba(255, 245, 247, 0.28), transparent 45%)',
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }}
      />
      {/* Static sun disc */}
      <div
        style={{
          position: 'absolute',
          left: '65%',
          top: '22%',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 232, 239, 0.96)',
          boxShadow: '0 0 40px 20px rgba(255, 194, 209, 0.55), 0 0 90px 45px rgba(236, 73, 153, 0.2)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </Layer>
  );
}

// ─── LAYER 2: LIGHT RAYS ─────────────────────────────────────────────────────
const RAYS = [
  { x: 660, w: 60,  h: 560, rot: -15, delay: '0s'   },
  { x: 700, w: 80,  h: 640, rot: -5,  delay: '1.2s'  },
  { x: 740, w: 50,  h: 560, rot:  5,  delay: '2.4s'  },
  { x: 780, w: 70,  h: 620, rot: 15,  delay: '3.6s'  },
  { x: 720, w: 45,  h: 500, rot: 20,  delay: '4.8s'  },
  { x: 680, w: 55,  h: 590, rot: -10, delay: '0.6s'  },
];

function LightRaysLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer zIndex={1} opacity={0.35} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <filter id="rayBlur"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        {RAYS.map((r, i) => (
          <polygon
            key={i}
            points={`${r.x},0 ${r.x - r.w / 2},${r.h} ${r.x + r.w / 2},${r.h}`}
            fill="rgba(255,248,200,0.4)"
            filter="url(#rayBlur)"
            style={{
              transformOrigin: `${r.x}px 0px`,
              transform: `rotate(${r.rot}deg)`,
              animation: `rayPulse 6s ease-in-out ${r.delay} infinite`,
            }}
          />
        ))}
      </svg>
    </Layer>
  );
}

// ─── LAYER 3: CUMULUS CLOUDS ─────────────────────────────────────────────────
// Cloud shape: overlapping circles + base rectangle
function CloudShape({ fill = 'white' }: { fill?: string }) {
  return (
    <g>
      <circle cx={0}   cy={0}   r={38} fill={fill} />
      <circle cx={40}  cy={-12} r={48} fill={fill} />
      <circle cx={88}  cy={-8}  r={42} fill={fill} />
      <circle cx={130} cy={0}   r={36} fill={fill} />
      <circle cx={160} cy={4}   r={28} fill={fill} />
      <rect x={0} y={0} width={188} height={42} fill={fill} />
    </g>
  );
}

const CLOUDS = [
  { top: 55,  scale: 1.0, duration: '90s',  delay: '0s'    },
  { top: 75,  scale: 1.2, duration: '110s', delay: '-35s'  },
  { top: 45,  scale: 0.8, duration: '95s',  delay: '-62s'  },
  { top: 85,  scale: 1.4, duration: '125s', delay: '-18s'  },
  { top: 62,  scale: 0.9, duration: '100s', delay: '-50s'  },
  { top: 70,  scale: 1.1, duration: '135s', delay: '-80s'  },
];

function CloudsLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer zIndex={2} opacity={0.82} layerRef={layerRef} willChangeTransform>
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: c.top,
            left: 0,
            width: 300,
            height: 100,
            animation: `cloudDrift ${c.duration} linear ${c.delay} infinite`,
          }}
        >
          {/* Shadow underneath */}
          <svg width={300} height={100} viewBox="0 0 300 100" style={{ position: 'absolute', top: 8, left: 4 }}>
            <g transform={`scale(${c.scale})`} opacity={0.4}>
              <CloudShape fill="rgba(253, 213, 223, 0.52)" />
            </g>
          </svg>
          {/* Cloud itself */}
          <svg width={300} height={100} viewBox="0 0 300 100" style={{ position: 'absolute', top: 0, left: 0 }}>
            <g transform={`scale(${c.scale})`}>
              <CloudShape />
            </g>
          </svg>
        </div>
      ))}
    </Layer>
  );
}

// ─── LAYER 4: FAR TREE SILHOUETTES ───────────────────────────────────────────
// Zig-zag conifer silhouette across the horizon
function FarTreesLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  // Deterministic zigzag path simulating a distant treeline
  const W = 1440, base = 900, horizon = 640;
  void W; // used in viewBox; silences unused-var warning
  const peaks: [number, number][] = [
    [0, base], [0, horizon + 60], [30, horizon + 20], [60, horizon + 75],
    [90, horizon - 10], [130, horizon + 30], [160, horizon - 20], [200, horizon + 40],
    [240, horizon + 5], [280, horizon - 30], [320, horizon + 20], [360, horizon - 15],
    [400, horizon + 35], [445, horizon - 25], [490, horizon + 10], [540, horizon - 40],
    [590, horizon + 20], [640, horizon - 10], [690, horizon + 30], [740, horizon - 20],
    [790, horizon + 15], [840, horizon - 35], [890, horizon + 5], [940, horizon - 25],
    [990, horizon + 40], [1040, horizon - 10], [1090, horizon + 20], [1140, horizon - 30],
    [1190, horizon + 10], [1240, horizon - 20], [1290, horizon + 30], [1340, horizon - 5],
    [1390, horizon + 25], [1440, horizon - 15], [1440, base],
  ];
  const d = peaks.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';

  return (
    <Layer zIndex={3} opacity={0.28} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <path d={d} fill="#2D5A3D" />
      </svg>
    </Layer>
  );
}

// ─── LAYER 5: FOREST TREES (replaces willows) ───────────────────────────────
interface TreeConfig {
  x: number;
  depth: 'distant' | 'mid' | 'foreground';
  trunkH: number;
  trunkW: number;
  canopyR: number;
  targetOpacity: number;
  phase: 1 | 2 | 3 | 4;
}

const FOREST_TREE_CONFIGS: TreeConfig[] = [
  { x: 60,   depth: 'distant',    trunkH: 100, trunkW: 12, canopyR: 55,  targetOpacity: 0.32, phase: 1 },
  { x: 1380, depth: 'distant',    trunkH: 100, trunkW: 12, canopyR: 55,  targetOpacity: 0.35, phase: 1 },
  { x: 180,  depth: 'mid',        trunkH: 155, trunkW: 15, canopyR: 78,  targetOpacity: 0.48, phase: 2 },
  { x: 720,  depth: 'mid',        trunkH: 160, trunkW: 16, canopyR: 82,  targetOpacity: 0.50, phase: 2 },
  { x: 1260, depth: 'mid',        trunkH: 152, trunkW: 15, canopyR: 76,  targetOpacity: 0.47, phase: 2 },
  { x: 400,  depth: 'mid',        trunkH: 165, trunkW: 16, canopyR: 80,  targetOpacity: 0.52, phase: 3 },
  { x: 1040, depth: 'mid',        trunkH: 158, trunkW: 15, canopyR: 79,  targetOpacity: 0.49, phase: 3 },
  { x: 20,   depth: 'foreground', trunkH: 240, trunkW: 22, canopyR: 110, targetOpacity: 0.62, phase: 4 },
  { x: 1420, depth: 'foreground', trunkH: 235, trunkW: 21, canopyR: 108, targetOpacity: 0.60, phase: 4 },
];

function ForestTree({ cfg, groundY = 860 }: { cfg: TreeConfig; groundY?: number }) {
  const { x, depth, trunkH, trunkW, canopyR } = cfg;

  const trunkColor = depth === 'distant' ? '#6B7B5E' : depth === 'foreground' ? '#3D2008' : '#5C3317';
  const foliageLight = depth === 'distant' ? '#5A7A4A' : depth === 'foreground' ? '#5AA040' : '#6AAF50';
  const foliageDark = depth === 'distant' ? '#4A6A3A' : depth === 'foreground' ? '#3A7A28' : '#4A8C3A';
  const foliageMid = depth === 'distant' ? '#506A44' : depth === 'foreground' ? '#478834' : '#57994A';

  const baseY = groundY;
  const trunkTopY = baseY - trunkH;
  const trunkBaseX = x;

  const halfW = trunkW / 2;
  const halfWTop = halfW * 0.55;
  const trunkPath = `M ${trunkBaseX - halfW} ${baseY} C ${trunkBaseX - halfW * 0.8} ${baseY - trunkH * 0.3} ${trunkBaseX - halfWTop * 1.1} ${trunkTopY + trunkH * 0.1} ${trunkBaseX - halfWTop} ${trunkTopY} L ${trunkBaseX + halfWTop} ${trunkTopY} C ${trunkBaseX + halfWTop * 1.1} ${trunkTopY + trunkH * 0.1} ${trunkBaseX + halfW * 0.8} ${baseY - trunkH * 0.3} ${trunkBaseX + halfW} ${baseY} Z`;

  const grainLines = [-halfW * 0.4, halfW * 0.1, halfW * 0.45].map((dx) => {
    const lx = trunkBaseX + dx;
    return `M ${lx} ${baseY - 10} C ${lx + 1.5} ${baseY - trunkH * 0.4} ${lx - 1} ${baseY - trunkH * 0.7} ${lx + 1} ${trunkTopY + 10}`;
  });

  const canopyY = trunkTopY - canopyR * 0.6;

  const branchL1x = trunkBaseX - trunkW * 0.3;
  const branchL1y = trunkTopY + trunkH * 0.25;
  const branchL2x = trunkBaseX - canopyR * 0.55;
  const branchL2y = canopyY + canopyR * 0.3;

  const branchR1x = trunkBaseX + trunkW * 0.3;
  const branchR1y = trunkTopY + trunkH * 0.2;
  const branchR2x = trunkBaseX + canopyR * 0.5;
  const branchR2y = canopyY + canopyR * 0.25;

  const branchLPath = `M ${branchL1x} ${branchL1y} Q ${trunkBaseX - canopyR * 0.3} ${trunkTopY + trunkH * 0.1} ${branchL2x} ${branchL2y}`;
  const branchRPath = `M ${branchR1x} ${branchR1y} Q ${trunkBaseX + canopyR * 0.28} ${trunkTopY + trunkH * 0.08} ${branchR2x} ${branchR2y}`;

  const clusters = [
    { cx: trunkBaseX, cy: canopyY, rx: canopyR * 0.75, ry: canopyR * 0.65, fill: foliageMid, isTop: true },
    { cx: trunkBaseX - canopyR * 0.45, cy: canopyY + canopyR * 0.2, rx: canopyR * 0.6, ry: canopyR * 0.5, fill: foliageDark, isTop: false },
    { cx: trunkBaseX + canopyR * 0.4, cy: canopyY + canopyR * 0.15, rx: canopyR * 0.58, ry: canopyR * 0.48, fill: foliageDark, isTop: false },
    { cx: trunkBaseX - canopyR * 0.2, cy: canopyY - canopyR * 0.35, rx: canopyR * 0.5, ry: canopyR * 0.4, fill: foliageLight, isTop: true },
    { cx: trunkBaseX + canopyR * 0.25, cy: canopyY - canopyR * 0.25, rx: canopyR * 0.45, ry: canopyR * 0.38, fill: foliageLight, isTop: true },
  ];

  const veinColor = depth === 'distant' ? '#3A5A2A' : '#2D5A1E';

  return (
    <g>
      {/* Ground shadow */}
      <ellipse
        cx={trunkBaseX + 15}
        cy={baseY + 4}
        rx={canopyR * 0.55}
        ry={8}
        fill="rgba(0,0,0,0.12)"
        style={{ filter: 'blur(4px)' }}
      />

      {/* Branch shadows */}
      <path d={branchLPath} stroke="rgba(0,0,0,0.18)" strokeWidth={trunkW * 0.28} fill="none" strokeLinecap="round" transform="translate(3,4)" />
      <path d={branchRPath} stroke="rgba(0,0,0,0.18)" strokeWidth={trunkW * 0.25} fill="none" strokeLinecap="round" transform="translate(3,4)" />

      {/* Trunk */}
      <path d={trunkPath} fill={trunkColor} />
      {grainLines.map((d, i) => (
        <path key={i} d={d} stroke="#3D2008" strokeWidth={0.8} fill="none" opacity={0.4} />
      ))}
      {/* Trunk highlight (left) */}
      <path
        d={`M ${trunkBaseX - halfWTop + 1} ${trunkTopY + 5} C ${trunkBaseX - halfW * 0.6} ${trunkTopY + trunkH * 0.35} ${trunkBaseX - halfW * 0.7} ${baseY - 30} ${trunkBaseX - halfW + 2} ${baseY - 10}`}
        stroke="#8B5E3C" strokeWidth={1.5} fill="none" opacity={0.6} strokeLinecap="round"
      />
      {/* Trunk shadow (right) */}
      <path
        d={`M ${trunkBaseX + halfWTop - 1} ${trunkTopY + 5} C ${trunkBaseX + halfW * 0.7} ${trunkTopY + trunkH * 0.3} ${trunkBaseX + halfW * 0.75} ${baseY - 35} ${trunkBaseX + halfW - 2} ${baseY - 8}`}
        stroke="#2A1505" strokeWidth={2} fill="none" opacity={0.5} strokeLinecap="round"
      />

      {/* Branches */}
      <path d={branchLPath} stroke={trunkColor} strokeWidth={trunkW * 0.28} fill="none" strokeLinecap="round" />
      <path d={branchRPath} stroke={trunkColor} strokeWidth={trunkW * 0.25} fill="none" strokeLinecap="round" />

      {/* Foliage clusters */}
      {clusters.map((cl, ci) => (
        <g key={ci} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>
          <ellipse cx={cl.cx} cy={cl.cy} rx={cl.rx} ry={cl.ry} fill={cl.fill} />
          {cl.isTop && (
            <>
              <line x1={cl.cx} y1={cl.cy - cl.ry * 0.5} x2={cl.cx} y2={cl.cy + cl.ry * 0.5} stroke={veinColor} strokeWidth={0.6} opacity={0.5} />
              <line x1={cl.cx - cl.rx * 0.3} y1={cl.cy - cl.ry * 0.1} x2={cl.cx - cl.rx * 0.6} y2={cl.cy + cl.ry * 0.15} stroke={veinColor} strokeWidth={0.6} opacity={0.5} />
              <line x1={cl.cx + cl.rx * 0.3} y1={cl.cy - cl.ry * 0.1} x2={cl.cx + cl.rx * 0.6} y2={cl.cy + cl.ry * 0.15} stroke={veinColor} strokeWidth={0.6} opacity={0.5} />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

function ForestTreesLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  const phase2Ref = useRef<SVGGElement>(null);
  const phase3Ref = useRef<SVGGElement>(null);
  const phase4Ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const revealed = new Set<number>([1]);

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const depth = total > 0 ? window.scrollY / total : 0;

      if (depth >= 0.25 && !revealed.has(2)) {
        revealed.add(2);
        if (phase2Ref.current) phase2Ref.current.style.opacity = '1';
      }
      if (depth >= 0.50 && !revealed.has(3)) {
        revealed.add(3);
        if (phase3Ref.current) phase3Ref.current.style.opacity = '1';
      }
      if (depth >= 0.75 && !revealed.has(4)) {
        revealed.add(4);
        if (phase4Ref.current) phase4Ref.current.style.opacity = '1';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const phase1Trees = FOREST_TREE_CONFIGS.filter(c => c.phase === 1);
  const phase2Trees = FOREST_TREE_CONFIGS.filter(c => c.phase === 2);
  const phase3Trees = FOREST_TREE_CONFIGS.filter(c => c.phase === 3);
  const phase4Trees = FOREST_TREE_CONFIGS.filter(c => c.phase === 4);

  return (
    <Layer zIndex={4} opacity={1} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Phase 1 — always visible */}
        <g>
          {phase1Trees.map((cfg, i) => (
            <g key={i} style={{ opacity: cfg.targetOpacity }}>
              <ForestTree cfg={cfg} />
            </g>
          ))}
        </g>

        {/* Phase 2 — appears at 25% scroll */}
        <g ref={phase2Ref} style={{ opacity: 0, transition: 'opacity 800ms ease-in-out' }}>
          {phase2Trees.map((cfg, i) => (
            <g key={i} style={{ opacity: cfg.targetOpacity }}>
              <ForestTree cfg={cfg} />
            </g>
          ))}
        </g>

        {/* Phase 3 — appears at 50% scroll */}
        <g ref={phase3Ref} style={{ opacity: 0, transition: 'opacity 800ms ease-in-out' }}>
          {phase3Trees.map((cfg, i) => (
            <g key={i} style={{ opacity: cfg.targetOpacity }}>
              <ForestTree cfg={cfg} />
            </g>
          ))}
        </g>

        {/* Phase 4 — appears at 75% scroll */}
        <g ref={phase4Ref} style={{ opacity: 0, transition: 'opacity 800ms ease-in-out' }}>
          {phase4Trees.map((cfg, i) => (
            <g key={i} style={{ opacity: cfg.targetOpacity }}>
              <ForestTree cfg={cfg} />
            </g>
          ))}
        </g>
      </svg>
    </Layer>
  );
}

// ─── LAYER 6: RED OAK FOLIAGE ────────────────────────────────────────────────
// Oak leaf: pointed ovate with slight lobing
const OAK_LEAF = 'M 0 -18 C 5 -14 11 -9 10 -2 C 14 -4 16 1 12 4 C 15 8 12 14 7 16 C 4 19 -4 19 -7 16 C -12 14 -15 8 -12 4 C -16 1 -14 -4 -10 -2 C -11 -9 -5 -14 0 -18 Z';

const OAK_COLORS = ['#8B1A1A', '#A0522D', '#C0392B', '#6B3728', '#9B2D2D', '#7A3520'];

// Left cluster: fanning inward from top-left
const LEFT_LEAVES = [
  { x:  20, y:  30, r: -40, s: 1.4, c: 0 }, { x:  55, y:  10, r: -20, s: 1.6, c: 1 },
  { x:  90, y:  20, r:  -5, s: 1.5, c: 2 }, { x: 125, y:  35, r:  10, s: 1.3, c: 3 },
  { x: 160, y:  18, r:  25, s: 1.2, c: 4 }, { x:  35, y:  60, r: -55, s: 1.3, c: 1 },
  { x:  70, y:  50, r: -30, s: 1.4, c: 2 }, { x: 110, y:  55, r:   0, s: 1.2, c: 0 },
  { x: 150, y:  60, r:  20, s: 1.1, c: 5 }, { x:  10, y:  90, r: -70, s: 1.0, c: 3 },
  { x:  50, y:  85, r: -45, s: 1.3, c: 4 }, { x:  95, y:  90, r: -15, s: 1.2, c: 1 },
  { x: 140, y:  80, r:  15, s: 1.0, c: 2 }, { x: 180, y:  50, r:  35, s: 1.1, c: 0 },
  { x:  25, y: 125, r: -60, s: 0.9, c: 5 }, { x:  75, y: 120, r: -35, s: 1.0, c: 3 },
  { x: 120, y: 115, r:  -5, s: 0.9, c: 4 }, { x:   5, y:  50, r: -80, s: 1.5, c: 2 },
];

// Right cluster: fanning inward from top-right
const RIGHT_LEAVES = [
  { x: 1420, y:  25, r:  45, s: 1.4, c: 0 }, { x: 1385, y:  12, r:  25, s: 1.5, c: 1 },
  { x: 1350, y:  22, r:   8, s: 1.4, c: 2 }, { x: 1310, y:  40, r:  -8, s: 1.3, c: 3 },
  { x: 1275, y:  20, r: -25, s: 1.2, c: 4 }, { x: 1405, y:  58, r:  60, s: 1.2, c: 1 },
  { x: 1370, y:  52, r:  35, s: 1.3, c: 0 }, { x: 1330, y:  55, r:   5, s: 1.2, c: 5 },
  { x: 1290, y:  60, r: -20, s: 1.1, c: 2 }, { x: 1435, y:  90, r:  75, s: 1.0, c: 3 },
  { x: 1390, y:  85, r:  50, s: 1.2, c: 4 }, { x: 1345, y:  88, r:  18, s: 1.1, c: 1 },
  { x: 1300, y:  82, r: -15, s: 1.0, c: 0 }, { x: 1260, y:  55, r: -35, s: 1.1, c: 5 },
  { x: 1415, y: 120, r:  65, s: 0.9, c: 2 }, { x: 1365, y: 118, r:  40, s: 1.0, c: 3 },
  { x: 1320, y: 115, r:  10, s: 0.9, c: 4 }, { x: 1440, y:  50, r:  85, s: 1.4, c: 1 },
];

function OakFoliageLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer zIndex={5} opacity={0.42} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Left cluster */}
        <g style={{ animation: 'leafRustle 3.5s ease-in-out 0s infinite' }}>
          {LEFT_LEAVES.map((l, i) => (
            <path
              key={i}
              d={OAK_LEAF}
              fill={OAK_COLORS[l.c]}
              transform={`translate(${l.x},${l.y}) rotate(${l.r}) scale(${l.s})`}
            />
          ))}
        </g>
        {/* Right cluster */}
        <g style={{ animation: 'leafRustle 3.5s ease-in-out 0.8s infinite' }}>
          {RIGHT_LEAVES.map((l, i) => (
            <path
              key={i}
              d={OAK_LEAF}
              fill={OAK_COLORS[l.c]}
              transform={`translate(${l.x},${l.y}) rotate(${l.r}) scale(${l.s})`}
            />
          ))}
        </g>
      </svg>
    </Layer>
  );
}

// ─── LAYER 7: IVY ────────────────────────────────────────────────────────────
// Heart-shaped ivy leaf
const IVY_LEAF = 'M 0 -9 C 4 -13 10 -8 10 -3 C 10 2 5 8 0 12 C -5 8 -10 2 -10 -3 C -10 -8 -4 -13 0 -9 Z';

// Vine: winding path down the left edge
const IVY_VINE_PATH = 'M 0 50 C 25 100 -10 150 15 200 C 35 250 -5 300 20 350 C 40 400 -8 450 18 500 C 38 550 -10 600 15 650 C 30 700 0 750 10 800';

// Leaf clusters along the vine
const IVY_LEAVES = [
  { x:  15, y: 100, r:  20, s: 1.1, dark: false },
  { x:  -5, y: 100, r: -30, s: 0.9, dark: true  },
  { x:  20, y: 150, r:  10, s: 1.0, dark: false },
  { x:  -8, y: 155, r: -15, s: 0.8, dark: true  },
  { x:  25, y: 210, r:  35, s: 1.2, dark: false },
  { x:   0, y: 215, r: -25, s: 1.0, dark: true  },
  { x:  18, y: 260, r:  15, s: 0.9, dark: false },
  { x:  -5, y: 268, r: -10, s: 1.1, dark: true  },
  { x:  22, y: 310, r:  28, s: 1.0, dark: false },
  { x:  -2, y: 318, r: -20, s: 0.9, dark: true  },
  { x:  16, y: 360, r:  18, s: 1.1, dark: false },
  { x:  -4, y: 370, r: -35, s: 0.8, dark: true  },
  { x:  24, y: 410, r:  22, s: 1.0, dark: false },
  { x:   2, y: 418, r: -15, s: 0.9, dark: true  },
  { x:  20, y: 455, r:  30, s: 1.2, dark: false },
  { x:  -5, y: 465, r: -20, s: 1.0, dark: true  },
  { x:  15, y: 505, r:  12, s: 0.9, dark: false },
  { x:  -3, y: 515, r: -28, s: 1.0, dark: true  },
  { x:  22, y: 558, r:  25, s: 1.1, dark: false },
  { x:   0, y: 565, r: -12, s: 0.8, dark: true  },
];

function IvyLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer zIndex={6} opacity={0.45} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Main vine */}
        <path
          d={IVY_VINE_PATH}
          stroke="#3D6B35"
          strokeWidth={2}
          fill="none"
          className="ivy-vine"
        />
        {/* Leaves */}
        {IVY_LEAVES.map((l, i) => (
          <path
            key={i}
            d={IVY_LEAF}
            fill={l.dark ? '#3A6B30' : '#4A7C3F'}
            transform={`translate(${l.x},${l.y}) rotate(${l.r}) scale(${l.s})`}
          />
        ))}
      </svg>
    </Layer>
  );
}

// ─── LAYER 8: BLUEBELLS ──────────────────────────────────────────────────────
// Bell drooping shape
const BELL_PATH = 'M -6 0 C -8 4 -8 10 -4 14 C -2 16 2 16 4 14 C 8 10 8 4 6 0 C 4 -2 -4 -2 -6 0 Z';

const BLUEBELLS: { x: number; y: number; stemH: number; dark: boolean; delay: string }[] = [
  { x: 60,   y: 810, stemH: 55, dark: false, delay: '0s'    },
  { x: 100,  y: 820, stemH: 70, dark: true,  delay: '0.2s'  },
  { x: 145,  y: 800, stemH: 50, dark: false, delay: '0.4s'  },
  { x: 190,  y: 815, stemH: 65, dark: true,  delay: '0.6s'  },
  { x: 240,  y: 805, stemH: 58, dark: false, delay: '0.8s'  },
  { x: 285,  y: 822, stemH: 72, dark: true,  delay: '1.0s'  },
  { x: 335,  y: 808, stemH: 48, dark: false, delay: '1.2s'  },
  { x: 385,  y: 818, stemH: 68, dark: true,  delay: '0.3s'  },
  { x: 435,  y: 802, stemH: 60, dark: false, delay: '0.5s'  },
  { x: 480,  y: 820, stemH: 75, dark: true,  delay: '0.7s'  },
  { x: 530,  y: 810, stemH: 52, dark: false, delay: '0.9s'  },
  { x: 580,  y: 816, stemH: 66, dark: true,  delay: '1.1s'  },
  { x: 630,  y: 804, stemH: 58, dark: false, delay: '0.2s'  },
  { x: 680,  y: 822, stemH: 70, dark: true,  delay: '0.4s'  },
  { x: 730,  y: 808, stemH: 55, dark: false, delay: '0.6s'  },
  { x: 780,  y: 818, stemH: 72, dark: true,  delay: '0.8s'  },
  { x: 830,  y: 806, stemH: 48, dark: false, delay: '1.0s'  },
  { x: 880,  y: 820, stemH: 65, dark: true,  delay: '0.1s'  },
  { x: 930,  y: 810, stemH: 60, dark: false, delay: '0.3s'  },
  { x: 980,  y: 815, stemH: 74, dark: true,  delay: '0.5s'  },
  { x: 1030, y: 804, stemH: 52, dark: false, delay: '0.7s'  },
  { x: 1080, y: 820, stemH: 68, dark: true,  delay: '0.9s'  },
  { x: 1130, y: 808, stemH: 56, dark: false, delay: '1.1s'  },
  { x: 1180, y: 818, stemH: 70, dark: true,  delay: '0.2s'  },
  { x: 1230, y: 806, stemH: 62, dark: false, delay: '0.4s'  },
  { x: 1280, y: 820, stemH: 50, dark: true,  delay: '0.6s'  },
  { x: 1330, y: 810, stemH: 66, dark: false, delay: '0.8s'  },
  { x: 1380, y: 814, stemH: 72, dark: true,  delay: '1.0s'  },
];

function Bluebell({ x, y, stemH, dark, delay }: typeof BLUEBELLS[0]) {
  const bellFill = dark ? '#8B9FE4' : '#6B7FD4';
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Stem */}
      <line x1={0} y1={0} x2={0} y2={-stemH} stroke="#5A8A4A" strokeWidth={1.5} />
      {/* Drooping bell */}
      <g
        transform={`translate(0,${-stemH})`}
        style={{ animation: `bellSway 3s ease-in-out ${delay} infinite`, transformOrigin: '0px 0px' }}
      >
        <path d={BELL_PATH} fill={bellFill} transform="translate(0,-14)" />
        {/* Small leaves at base */}
        <ellipse cx={-6} cy={-2} rx={5} ry={2.5} fill="#4A7A3A" transform="rotate(-25)" />
        <ellipse cx={ 6} cy={-2} rx={5} ry={2.5} fill="#4A7A3A" transform="rotate(25)" />
      </g>
    </g>
  );
}

function BluebellsLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer zIndex={7} opacity={0.52} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {BLUEBELLS.map((b, i) => <Bluebell key={i} {...b} />)}
      </svg>
    </Layer>
  );
}

// ─── LAYER 9: LILIES ─────────────────────────────────────────────────────────
interface LilyProps { x: number; y: number; pink: boolean; delay: string }

function Lily({ x, y, pink, delay }: LilyProps) {
  const petalFill = pink ? '#FF6B8A' : '#FFB347';
  const stemY = y + 90;
  return (
    <g
      transform={`translate(${x},${stemY})`}
      style={{ animation: `lilyBob 4.5s ease-in-out ${delay} infinite`, transformOrigin: `${x}px ${stemY}px` }}
    >
      {/* Stem */}
      <line x1={0} y1={0} x2={0} y2={-100} stroke="#4A7A3A" strokeWidth={3} />
      {/* Large leaves */}
      <ellipse cx={-18} cy={-45} rx={20} ry={8} fill="#3D6B2A" transform="rotate(-30,-18,-45)" />
      <ellipse cx={ 18} cy={-55} rx={20} ry={8} fill="#3D6B2A" transform="rotate(25,18,-55)" />
      {/* 6 petals */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx={0} cy={-14}
          rx={6} ry={16}
          fill={petalFill}
          transform={`rotate(${angle}) translate(0,-10) rotate(${angle * -1}) rotate(${angle})`}
          style={{ transformOrigin: '0px -100px' }}
        />
      ))}
      {/* Petals as simple rotated ellipses from centre */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const px = Math.sin(rad) * 14;
        const py = -100 + Math.cos(rad) * 14;
        return (
          <ellipse
            key={`p${i}`}
            cx={px} cy={py}
            rx={7} ry={17}
            fill={petalFill}
            opacity={0.88}
            transform={`rotate(${angle}, ${px}, ${py})`}
          />
        );
      })}
      {/* Centre */}
      <circle cx={0} cy={-100} r={6} fill="#FFD700" />
      {/* Stamens */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={`s${i}`}
            x1={0} y1={-100}
            x2={Math.sin(rad) * 10} y2={-100 - Math.cos(rad) * 10}
            stroke="#C8A020"
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}

const LILIES: LilyProps[] = [
  { x: 100,  y: 650, pink: true,  delay: '0s'   },
  { x: 185,  y: 670, pink: false, delay: '1.2s' },
  { x: 270,  y: 655, pink: true,  delay: '2.4s' },
  { x: 1175, y: 660, pink: false, delay: '0.8s' },
  { x: 1265, y: 645, pink: true,  delay: '2.0s' },
  { x: 1350, y: 665, pink: false, delay: '1.5s' },
];

function LiliesLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer zIndex={8} opacity={0.50} layerRef={layerRef} willChangeTransform>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {LILIES.map((l, i) => <Lily key={i} {...l} />)}
      </svg>
    </Layer>
  );
}

// ─── LAYER 10: FOREGROUND GRASS ──────────────────────────────────────────────
// Deterministic grass blade positions and curves
const BLADES: { x: number; h: number; cx: number; col: string; delay: string }[] = [
  { x:  20, h:  90, cx:  8, col: '#3D7A35', delay: '0s'    },
  { x:  50, h:  75, cx: -6, col: '#4A8A40', delay: '0.3s'  },
  { x:  80, h: 110, cx: 10, col: '#3A7030', delay: '0.6s'  },
  { x: 110, h:  80, cx: -8, col: '#5A9A45', delay: '0.9s'  },
  { x: 140, h:  95, cx:  7, col: '#3D7A35', delay: '0.2s'  },
  { x: 170, h:  70, cx: -5, col: '#4A8A40', delay: '0.5s'  },
  { x: 205, h: 105, cx: 11, col: '#5A9A45', delay: '0.8s'  },
  { x: 235, h:  85, cx: -9, col: '#3A7030', delay: '1.1s'  },
  { x: 265, h:  90, cx:  6, col: '#3D7A35', delay: '0.4s'  },
  { x: 295, h:  75, cx: -7, col: '#4A8A40', delay: '0.7s'  },
  { x: 330, h: 115, cx: 12, col: '#5A9A45', delay: '1.0s'  },
  { x: 360, h:  80, cx: -6, col: '#3D7A35', delay: '0.1s'  },
  { x: 395, h:  95, cx:  8, col: '#3A7030', delay: '0.4s'  },
  { x: 425, h:  70, cx: -8, col: '#4A8A40', delay: '0.7s'  },
  { x: 455, h: 100, cx: 10, col: '#3D7A35', delay: '1.0s'  },
  { x: 490, h:  85, cx: -7, col: '#5A9A45', delay: '0.3s'  },
  { x: 520, h:  90, cx:  9, col: '#4A8A40', delay: '0.6s'  },
  { x: 555, h:  75, cx: -6, col: '#3A7030', delay: '0.9s'  },
  { x: 585, h: 105, cx: 11, col: '#3D7A35', delay: '0.2s'  },
  { x: 620, h:  80, cx: -9, col: '#5A9A45', delay: '0.5s'  },
  { x: 650, h:  95, cx:  7, col: '#4A8A40', delay: '0.8s'  },
  { x: 685, h:  70, cx: -5, col: '#3D7A35', delay: '1.1s'  },
  { x: 715, h: 110, cx: 12, col: '#3A7030', delay: '0.4s'  },
  { x: 750, h:  85, cx: -8, col: '#5A9A45', delay: '0.7s'  },
  { x: 780, h:  90, cx:  6, col: '#4A8A40', delay: '1.0s'  },
  { x: 815, h:  75, cx: -7, col: '#3D7A35', delay: '0.1s'  },
  { x: 845, h: 100, cx: 10, col: '#3A7030', delay: '0.4s'  },
  { x: 880, h:  80, cx: -6, col: '#5A9A45', delay: '0.7s'  },
  { x: 910, h:  95, cx:  9, col: '#4A8A40', delay: '1.0s'  },
  { x: 945, h:  70, cx: -8, col: '#3D7A35', delay: '0.3s'  },
  { x: 975, h: 115, cx: 11, col: '#5A9A45', delay: '0.6s'  },
  { x:1010, h:  85, cx: -7, col: '#3A7030', delay: '0.9s'  },
  { x:1040, h:  90, cx:  8, col: '#4A8A40', delay: '0.2s'  },
  { x:1075, h:  75, cx: -6, col: '#3D7A35', delay: '0.5s'  },
  { x:1105, h: 105, cx: 10, col: '#5A9A45', delay: '0.8s'  },
  { x:1140, h:  80, cx: -9, col: '#3A7030', delay: '1.1s'  },
  { x:1170, h:  95, cx:  7, col: '#4A8A40', delay: '0.4s'  },
  { x:1205, h:  70, cx: -5, col: '#3D7A35', delay: '0.7s'  },
  { x:1235, h: 110, cx: 12, col: '#5A9A45', delay: '1.0s'  },
  { x:1270, h:  85, cx: -8, col: '#3D7A35', delay: '0.3s'  },
  { x:1300, h:  90, cx:  6, col: '#4A8A40', delay: '0.6s'  },
  { x:1335, h:  75, cx: -7, col: '#3A7030', delay: '0.9s'  },
  { x:1365, h: 100, cx: 10, col: '#5A9A45', delay: '0.2s'  },
  { x:1400, h:  80, cx: -6, col: '#3D7A35', delay: '0.5s'  },
  { x:1430, h:  95, cx:  8, col: '#4A8A40', delay: '0.8s'  },
];

function ForegroundGrassLayer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Layer
      zIndex={9}
      opacity={0.40}
      layerRef={layerRef}
      willChangeTransform
      extraStyle={{ filter: 'blur(1.5px)' }}
    >
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {BLADES.map((b, i) => (
          <path
            key={i}
            d={`M ${b.x} 900 Q ${b.x + b.cx} ${900 - b.h / 2} ${b.x + b.cx * 0.7} ${900 - b.h}`}
            stroke={b.col}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            style={{ animation: `willowSway 4s ease-in-out ${b.delay} infinite` }}
          />
        ))}
      </svg>
    </Layer>
  );
}

// ─── PARALLAX MULTIPLIERS ────────────────────────────────────────────────────
const PARALLAX = [0.0, 0.05, 0.08, 0.12, 0.18, 0.22, 0.28, 0.35, 0.40, 0.55];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ForestBackground(): React.ReactElement {
  const refs = [
    useRef<HTMLDivElement>(null), // 0 sky
    useRef<HTMLDivElement>(null), // 1 rays
    useRef<HTMLDivElement>(null), // 2 clouds
    useRef<HTMLDivElement>(null), // 3 far trees
    useRef<HTMLDivElement>(null), // 4 willows
    useRef<HTMLDivElement>(null), // 5 oak
    useRef<HTMLDivElement>(null), // 6 ivy
    useRef<HTMLDivElement>(null), // 7 bluebells
    useRef<HTMLDivElement>(null), // 8 lilies
    useRef<HTMLDivElement>(null), // 9 grass
  ];

  // Parallax scroll (existing)
  useEffect(() => {
    const isMobile = () => window.innerWidth < 768;

    const onScroll = () => {
      if (isMobile()) return; // disable parallax on mobile
      const y = window.scrollY;
      refs.forEach((ref, i) => {
        if (ref.current) {
          ref.current.style.transform = `translateY(${y * PARALLAX[i]}px)`;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // refs array is stable — only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <SkyLayer         layerRef={refs[0]} />
      <LightRaysLayer   layerRef={refs[1]} />
      <CloudsLayer      layerRef={refs[2]} />
      <FarTreesLayer    layerRef={refs[3]} />
      <ForestTreesLayer layerRef={refs[4]} />
      <OakFoliageLayer  layerRef={refs[5]} />
      <IvyLayer         layerRef={refs[6]} />
      <BluebellsLayer   layerRef={refs[7]} />
      <LiliesLayer      layerRef={refs[8]} />
      <ForegroundGrassLayer layerRef={refs[9]} />
    </div>
  );
}
