import { useEffect, useId, useRef, useState } from 'react';
import { profile2, profile3, profilePlane } from '../assets';
import journalBg from '../assets/journal.PNG';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Page {
  left: React.ReactNode;
  right: React.ReactNode;
}

type Direction = 'forward' | 'back';

interface FlipState {
  direction: Direction;
  fromSpread: number;
  toSpread: number;
}

// ─── DECORATIONS ─────────────────────────────────────────────────────────────

// A visa-style stamp: a circular ring with arc text, like an aged ink stamp.
function VisaStamp({
  color,
  arcText,
  centerText,
  rotation = -12,
}: {
  color: string;
  arcText: string;
  centerText: string;
  rotation?: number;
}) {
  const arcId = useId();
  return (
    <svg
      viewBox="0 0 80 80"
      width="80"
      height="80"
      style={{ transform: `rotate(${rotation}deg)`, opacity: 0.55 }}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="1.5" />
      <path id={arcId} d="M 4,46 A 34,34 0 1,1 76,46" fill="none" />
      <text fontSize="4.6" fill={color} letterSpacing="0.4" fontFamily='"Courier Prime", monospace' textAnchor="middle">
        <textPath href={`#${arcId}`} startOffset="50%">{arcText}</textPath>
      </text>
      <text x="40" y="46" fontSize="9" fill={color} textAnchor="middle" fontFamily='"Courier Prime", monospace' fontWeight={700}>
        {centerText}
      </text>
    </svg>
  );
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────
// Edit the text here to update what appears on each page spread.
// A "spread" = left page + right page shown together.

const getSpreads = (): Page[] => [
  // SPREAD 0 — Cover
  {
    left: (
      <div style={styles.coverLeft}>
        <div style={styles.coverStampBox}>
          <p style={styles.stampHeader}>FIELD NOTES</p>
          <p style={styles.stampName}>Harriet Fletcher</p>
          <div style={styles.stampRule} />
          <p style={styles.stampRole}>The story of my Career</p>
          <p style={styles.stampLocation}>Liverpool &middot; 2026</p>
        </div>
      </div>
    ),
    right: (
      <div style={styles.photoPage}>
        <div style={styles.photoFrame}>
          <img src={profilePlane} alt="Harriet" style={styles.photo} />
          <p style={styles.photoCaption}>fig. 1 — I've travelled to many destinations near and far both figuratively and in actuality</p>
        </div>
      </div>
    ),
  },

  // SPREAD 1 — Roots: Ecology
  {
    left: (
      <div style={styles.textPage}>
        <p style={{ ...styles.pageLabel, ...styles.entranceLabel }}>chapter i</p>
        <h2 style={{ ...styles.pageTitle, ...styles.entranceTitle }}>The Roots</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={styles.bodyText}>
            Lancaster University. Before I wrote a line of code, I was
            mapping habitats, modelling populations, and learning to
            read a landscape as a system of interlocking dependencies.
          </p>
          <p style={styles.bodyText}>
            Ecology gave me the instinct that every complex problem has
            an underlying structure.
          </p>
          <ul style={styles.noteList}>
            <li>🌿 Systems thinking</li>
            <li>🗺️ GIS &amp; spatial analysis</li>
            <li>🔬 Scientific method</li>
            <li>📊 Field data collection</li>
          </ul>
        </div>
      </div>
    ),
    right: (
      <div style={styles.photoPage}>
        <div style={{ ...styles.visaStampSlot, ...styles.entrancePin }}>
          <VisaStamp color={STAMP_GREEN} arcText="BSC ECOLOGY &amp; CONSERVATION" centerText="2019&ndash;2022" />
        </div>
        <div style={{ ...styles.stampBox, ...styles.entrancePin }}>
          <p style={styles.stampLabel}>Lancaster University</p>
          <p style={styles.stampYear}>2019 – 2022</p>
          <p style={styles.stampDegree}>BSc Ecology &amp; Conservation</p>
          <p style={styles.stampResult}>First Class Honours</p>
        </div>
        <p style={styles.handNote}>
          Every ecosystem is a network. Every network has a logic.
          Finding that logic — before the computer does — is the skill.
        </p>
        <div style={styles.sketchBox}>
          <svg viewBox="0 0 180 80" width="180" height="80">
            <text x="10" y="20" fontSize="11" fill="#7a6652" fontFamily="Georgia, serif">roots → trunk → canopy</text>
            <line x1="10" y1="30" x2="170" y2="30" stroke="#c4a882" strokeWidth="0.8" strokeDasharray="4,3"/>
            <text x="10" y="48" fontSize="10" fill="#9e8470" fontFamily="Georgia, serif">ecology → data → code</text>
            <text x="10" y="68" fontSize="10" fill="#b89d82" fontFamily="Georgia, serif">the same shape, different scale</text>
          </svg>
        </div>
      </div>
    ),
  },

  // SPREAD 2 — MSc Data Science & AI
  {
    left: (
      <div style={styles.textPage}>
        <p style={{ ...styles.pageLabel, ...styles.entranceLabel }}>chapter ii</p>
        <h2 style={{ ...styles.pageTitle, ...styles.entranceTitle }}>the stream</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={styles.bodyText}>
            MSc Data Science &amp; AI, University of Liverpool. I crossed
            from the natural world into the computational one — and found
            that the vocabulary was different but the questions were the same.
          </p>
          <p style={styles.bodyText}>
            Machine learning, data engineering, statistical modelling,
            applied AI. I graduated with a strong interest in automation
            and the infrastructure that keeps data clean and moving.
          </p>
          <ul style={styles.noteList}>
            <li>🤖 Machine learning &amp; AI</li>
            <li>⚙️ Data pipelines</li>
            <li>📐 Statistical modelling</li>
            <li>🧠 Neural networks</li>
          </ul>
        </div>
      </div>
    ),
    right: (
      <div style={styles.photoPage}>
        <div style={{ ...styles.visaStampSlot, ...styles.entrancePin }}>
          <VisaStamp color={MAP_BLUE} arcText="MSC DATA SCIENCE &amp; AI" centerText="2022&ndash;2023" />
        </div>
        <div style={styles.entrancePin}>
          <div style={styles.photoFrame}>
            <img src={profile2} alt="Harriet at university" style={styles.photo} />
            <p style={styles.photoCaption}>fig. 2 — somewhere between the data and the deadline</p>
          </div>
        </div>
        <div style={{ ...styles.stampBox, ...styles.entrancePin, marginTop: '12px' }}>
          <p style={styles.stampLabel}>University of Liverpool</p>
          <p style={styles.stampYear}>2022 – 2023</p>
          <p style={styles.stampDegree}>MSc Data Science &amp; AI</p>
        </div>
      </div>
    ),
  },

  // SPREAD 3 — Developer skills
  {
    left: (
      <div style={styles.textPage}>
        <p style={{ ...styles.pageLabel, ...styles.entranceLabel }}>chapter iii</p>
        <h2 style={{ ...styles.pageTitle, ...styles.entranceTitle }}>the clearing</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={styles.bodyText}>
            Junior Developer at Pfizer via Jakala. TypeScript, React,
            Python, FastAPI — the stack I'm building fluency in. I care
            about writing code that is efficient, readable, and does
            exactly one thing well.
          </p>
          <p style={styles.bodyText}>
            My particular interest: automation and applied AI. If a
            process runs twice it should run itself. If a gap exists
            between what a system does and what it should do, I want
            to close it.
          </p>
          <div style={{ ...styles.pillRow, ...styles.entrancePin }}>
            {['TypeScript','React','Python','FastAPI','Git','PostgreSQL'].map(s => (
              <span key={s} style={styles.pill}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    right: (
      <div style={styles.textPage}>
        <p style={{ ...styles.pageLabel, ...styles.entranceLabel }}>tools &amp; interests</p>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={{ ...styles.toolGrid, ...styles.entranceBody }}>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>⚙️</span>
            <div>
              <p style={styles.toolName}>Automation</p>
              <p style={styles.toolDesc}>Remove friction from repeated processes</p>
            </div>
          </div>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>🏗️</span>
            <div>
              <p style={styles.toolName}>Data architecture</p>
              <p style={styles.toolDesc}>Structure before syntax, always</p>
            </div>
          </div>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>🌍</span>
            <div>
              <p style={styles.toolName}>Geospatial AI</p>
              <p style={styles.toolDesc}>QGIS, H3, Deck.gl, satellite data</p>
            </div>
          </div>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>🤖</span>
            <div>
              <p style={styles.toolName}>LLM integration</p>
              <p style={styles.toolDesc}>RAG pipelines, prompt engineering</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // SPREAD 4 — The hackathon / closing
  {
    left: (
      <div style={styles.textPage}>
        <p style={{ ...styles.pageLabel, ...styles.entranceLabel }}>chapter iv</p>
        <h2 style={{ ...styles.pageTitle, ...styles.entranceTitle }}>the signal fire</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={styles.bodyText}>
            I secured this role by winning a website deployment hackathon.
            Not because I knew everything — but because I shipped something
            when it mattered, and it worked.
          </p>
          <p style={styles.bodyText}>
            I don't come from a traditional dev background. I came from
            field notes and data models. That background is the thing
            I'd least want to change.
          </p>
          <div style={{ ...styles.badgeBox, ...styles.entrancePin }}>
            🏆 &nbsp; Website deployment hackathon — placed
          </div>
        </div>
      </div>
    ),
    right: (
      <div style={styles.photoPage}>
        <div style={styles.entrancePin}>
          <div style={styles.photoFrame}>
            <img src={profile3} alt="Harriet" style={styles.photo} />
            <p style={styles.photoCaption}>fig. 3 — ready to build things that matter</p>
          </div>
        </div>
        <p style={styles.handNote}>
          harrietfletcherool@gmail.com<br />
          github.com/Harriet101-alt
        </p>
        <p style={{ ...styles.coverHint, marginTop: '8px' }}>← end of field notes</p>
      </div>
    ),
  },
];

// ─── PAGE LAYER ──────────────────────────────────────────────────────────────
// The 4-layer DOM anatomy of a single page surface (shadow receiver / back
// face / front face / curve shading), shared by static, outgoing and
// incoming page instances.

interface PageLayerProps {
  content: React.ReactNode;
  pageNumber: number;
  side: 'left' | 'right';
  variant: 'static' | 'outgoing' | 'incoming';
  direction?: Direction;
  showCastShadow?: boolean;
}

// ── Spiral wire binding SVG ───────────────────────────────────────────────────
function SpiralBinding({ bookHeight, topPad, botPad }: { bookHeight: number; topPad: number; botPad: number }) {
  const coilCount = 16;
  const usable = bookHeight - topPad - botPad;
  const spacing = usable / (coilCount - 1);
  const cx = 35;
  const rx = 20;
  const ry = 8;
  return (
    <svg
      width="70" height={bookHeight}
      aria-hidden="true"
      style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', zIndex: 20, pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Terracotta spine rod */}
      <rect x={cx - 3} y={topPad - 14} width="6" height={usable + 28} rx="3" fill="#b8845a" />
      {/* Back halves — lighter, behind the rod */}
      {Array.from({ length: coilCount }, (_, i) => {
        const y = topPad + i * spacing;
        return <path key={`b${i}`} d={`M ${cx - rx},${y} A ${rx},${ry} 0 0 0 ${cx + rx},${y}`} stroke="#aaa" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
      })}
      {/* Front halves — darker, over the rod */}
      {Array.from({ length: coilCount }, (_, i) => {
        const y = topPad + i * spacing;
        return <path key={`f${i}`} d={`M ${cx + rx},${y} A ${rx},${ry} 0 0 0 ${cx - rx},${y}`} stroke="#1c1c1c" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function PageLayer({ content, pageNumber, side, variant, direction, showCastShadow }: PageLayerProps) {
  const isLeft = side === 'left';
  const transformOrigin = direction === 'forward' ? 'left center' : direction === 'back' ? 'right center' : 'center';

  let turnAnimation: string | undefined;
  let curveAnimation: string | undefined;

  if (variant === 'outgoing' && direction === 'forward') {
    turnAnimation = `pageTurnForward ${TURN_DURATION}ms ${TURN_EASING} both`;
    curveAnimation = `curveShadingForward ${TURN_DURATION}ms ${TURN_EASING} both`;
  } else if (variant === 'outgoing' && direction === 'back') {
    turnAnimation = `pageTurnBackward ${TURN_DURATION}ms ${TURN_EASING} both`;
    curveAnimation = `curveShadingBackward ${TURN_DURATION}ms ${TURN_EASING} both`;
  } else if (variant === 'incoming' && direction === 'forward') {
    turnAnimation = `pageLandForward ${LAND_DURATION}ms ${TURN_EASING} ${LAND_DELAY}ms both`;
  } else if (variant === 'incoming' && direction === 'back') {
    turnAnimation = `pageLandBackward ${LAND_DURATION}ms ${TURN_EASING} ${LAND_DELAY}ms both`;
  }

  return (
    <div
      style={{
        ...styles.pageContainer,
        ...(variant === 'incoming' ? styles.pageContainerOverlay : null),
        transformOrigin,
        animation: turnAnimation,
      }}
    >
      <div
        style={{
          ...styles.pageShadowReceiver,
          animation: showCastShadow ? `castShadow ${TURN_DURATION}ms ease both` : undefined,
        }}
      />
      <div style={styles.pageBack} />
      <div key={`${side}-${pageNumber}`} style={isLeft ? styles.pageFrontLeft : styles.pageFrontRight}>
        {content}
        {/* Paper grain overlay — pointer-events off so it never blocks interaction */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          filter: 'url(#paper-grain)', mixBlendMode: 'multiply', opacity: 0.4, zIndex: 10,
        }} />
      </div>
      <div style={{ ...styles.pageCurveShadow, animation: curveAnimation }} />
      <span style={{ ...styles.pageNum, [isLeft ? 'left' : 'right']: '16px' }}>{pageNumber}</span>
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const TURN_DURATION = 700;
const LAND_DURATION = 400;
const LAND_DELAY = 300;
const TURN_EASING = 'cubic-bezier(0.645, 0.045, 0.355, 1.000)';

export default function FlipJournal() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [journalVisible, setJournalVisible] = useState(false);
  const [dismissedForward, setDismissedForward] = useState(false);
  const [dismissedBack, setDismissedBack] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const spreads = getSpreads();
  const total = spreads.length;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setJournalVisible(true); },
      { threshold: 0.15 }
    );
    if (wrapperRef.current) obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  function goTo(direction: Direction) {
    if (flip) return;
    if (direction === 'forward' && currentSpread >= total - 1) return;
    if (direction === 'back' && currentSpread <= 0) return;

    if (direction === 'forward') setDismissedForward(true);
    if (direction === 'back') setDismissedBack(true);

    const toSpread = direction === 'forward' ? currentSpread + 1 : currentSpread - 1;
    setFlip({ direction, fromSpread: currentSpread, toSpread });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentSpread(toSpread);
      setFlip(null);
    }, TURN_DURATION);
  }

  const spread = spreads[currentSpread];
  const outgoingSpread = flip ? spreads[flip.fromSpread] : null;
  const incomingSpread = flip ? spreads[flip.toSpread] : null;
  const isTurningRight = flip?.direction === 'forward';
  const isTurningLeft = flip?.direction === 'back';

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      {/* SVG paper-grain filter definition — zero size, never visible */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.025 0" />
        </filter>
      </svg>
      {/* Journal book — bookFrame is a plain 2D stacking box so the corner
          touch zones below sit reliably above book's 3D perspective context */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={styles.bookFrame}>
      <div style={styles.book}>

        {/* Left page */}
        {isTurningLeft && flip && outgoingSpread && incomingSpread ? (
          <>
            <PageLayer
              content={outgoingSpread.left}
              pageNumber={flip.fromSpread * 2 + 1}
              side="left"
              variant="outgoing"
              direction={flip.direction}
            />
            <PageLayer
              content={incomingSpread.left}
              pageNumber={flip.toSpread * 2 + 1}
              side="left"
              variant="incoming"
              direction={flip.direction}
            />
          </>
        ) : (
          <PageLayer
            content={spread.left}
            pageNumber={currentSpread * 2 + 1}
            side="left"
            variant="static"
            showCastShadow={isTurningRight}
          />
        )}

        {/* Spiral binding — absolutely positioned SVG overlay */}
        <SpiralBinding bookHeight={736} topPad={56} botPad={56} />

        {/* Spine spacer — keeps flex layout gap between pages */}
        <div style={styles.spine} />

        {/* Right page */}
        {isTurningRight && flip && outgoingSpread && incomingSpread ? (
          <>
            <PageLayer
              content={outgoingSpread.right}
              pageNumber={flip.fromSpread * 2 + 2}
              side="right"
              variant="outgoing"
              direction={flip.direction}
            />
            <PageLayer
              content={incomingSpread.right}
              pageNumber={flip.toSpread * 2 + 2}
              side="right"
              variant="incoming"
              direction={flip.direction}
            />
          </>
        ) : (
          <PageLayer
            content={spread.right}
            pageNumber={currentSpread * 2 + 2}
            side="right"
            variant="static"
            showCastShadow={isTurningLeft}
          />
        )}
      </div>

      {/* Corner touch zones — sit outside book's 3D/perspective context so
          they stack reliably above the page content; offsets match book's
          border thickness (18px 20px 22px 19px = top right bottom left) */}
      <div
        className="page-corner"
        role="button"
        aria-label="Previous page"
        onClick={() => goTo('back')}
        style={{
          ...styles.pageCorner,
          top: '18px',
          left: '19px',
          cursor: currentSpread === 0 ? 'default' : 'pointer',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      <div
        className="page-corner"
        role="button"
        aria-label="Previous page"
        onClick={() => goTo('back')}
        style={{
          ...styles.pageCorner,
          bottom: '22px',
          left: '19px',
          cursor: currentSpread === 0 ? 'default' : 'pointer',
          clipPath: 'polygon(0 100%, 0 0, 100% 100%)',
        }}
      />
      <div
        className="page-corner"
        role="button"
        aria-label="Next page"
        onClick={() => goTo('forward')}
        style={{
          ...styles.pageCorner,
          top: '18px',
          right: '20px',
          cursor: currentSpread === total - 1 ? 'default' : 'pointer',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }}
      />
      <div
        className="page-corner"
        role="button"
        aria-label="Next page"
        onClick={() => goTo('forward')}
        style={{
          ...styles.pageCorner,
          bottom: '22px',
          right: '20px',
          cursor: currentSpread === total - 1 ? 'default' : 'pointer',
          clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
        }}
      />

      </div>{/* end bookFrame */}

      {/* Forward "Turn Me" hint — below-right of book, arrow points up into right corner */}
      {journalVisible && !dismissedForward && currentSpread < total - 1 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: '10px',
            zIndex: 10,
            pointerEvents: 'none',
            width: '110px',
            textAlign: 'right',
          }}
        >
          <svg width="54" height="44" viewBox="0 0 54 44" style={{ display: 'block', marginLeft: 'auto', marginRight: '4px', marginBottom: '2px' }}>
            <defs>
              <filter id="pencil-fwd" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="turbulence" baseFrequency="0.065" numOctaves="3" seed="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <marker id="tm-fwd" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill={TURN_ME_GREEN} />
              </marker>
            </defs>
            {/* Arrow curves up-right toward the bottom-right page corner */}
            <path d="M 44,40 Q 50,20 44,4" stroke={TURN_ME_GREEN} strokeWidth="1.8" fill="none"
              strokeLinecap="round" strokeOpacity="0.82" markerEnd="url(#tm-fwd)"
              filter="url(#pencil-fwd)"
              style={{ strokeDasharray: 80, strokeDashoffset: 0 }}
            />
          </svg>
          <div style={{ fontFamily: '"Caveat", cursive', fontSize: '18px', color: TURN_ME_GREEN, lineHeight: 1.2, transform: 'rotate(3deg)', transformOrigin: 'right top' }}>
            {'Turn Me'.split('').map((ch, i) => (
              <span key={i} style={{ display: 'inline-block', opacity: 0, animation: `journalWriteChar 0.08s ease-out ${i * 45}ms both` }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Backward "Go backwards" hint — below-left of book, arrow points up into left corner */}
      {journalVisible && !dismissedBack && currentSpread > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '10px',
            zIndex: 10,
            pointerEvents: 'none',
            width: '140px',
          }}
        >
          <svg width="54" height="44" viewBox="0 0 54 44" style={{ display: 'block', marginRight: 'auto', marginLeft: '4px', marginBottom: '2px' }}>
            <defs>
              {/* Pencil/sketch displacement filter */}
              <filter id="pencil-bck" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="turbulence" baseFrequency="0.065" numOctaves="3" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              {/* Arrowhead — tip at right (x=7), so with orient="auto" upward path the tip points UP toward page */}
              <marker id="tm-bck" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill={TURN_ME_GREEN} />
              </marker>
            </defs>
            {/* Path from bottom to top — markerEnd tip points toward page */}
            <path d="M 10,40 Q 4,20 10,4" stroke={TURN_ME_GREEN} strokeWidth="1.8" fill="none"
              strokeLinecap="round" strokeOpacity="0.82" markerEnd="url(#tm-bck)"
              filter="url(#pencil-bck)"
              style={{ strokeDasharray: 80, strokeDashoffset: 0 }}
            />
          </svg>
          <div style={{ fontFamily: '"Caveat", cursive', fontSize: '18px', color: TURN_ME_GREEN, lineHeight: 1.2, transform: 'rotate(-3deg)', transformOrigin: 'left top' }}>
            {'Go backwards'.split('').map((ch, i) => (
              <span key={i} style={{ display: 'inline-block', opacity: 0, animation: `journalWriteChar 0.08s ease-out ${i * 45}ms both` }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Navigation */}
      <div style={styles.nav}>
        <button
          style={{
            ...styles.navBtn,
            opacity: currentSpread === 0 ? 0.25 : 1,
            cursor: currentSpread === 0 ? 'not-allowed' : 'pointer',
          }}
          onClick={() => goTo('back')}
          disabled={currentSpread === 0}
          aria-label="Previous page"
        >
          ← prev
        </button>

        <div style={styles.dots}>
          {spreads.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                background: i === currentSpread ? '#8b6f47' : '#d4c4ae',
              }}
            />
          ))}
        </div>

        <button
          style={{
            ...styles.navBtn,
            opacity: currentSpread === total - 1 ? 0.25 : 1,
            cursor: currentSpread === total - 1 ? 'not-allowed' : 'pointer',
          }}
          onClick={() => goTo('forward')}
          disabled={currentSpread === total - 1}
          aria-label="Next page"
        >
          next →
        </button>
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');
        @keyframes journalWriteChar {
          from { opacity: 0; transform: translateY(3px) scale(0.7) rotate(-6deg); }
          to   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes pageTurnForward {
          0%   { transform: rotateY(0deg);    box-shadow: none; }
          8%   { box-shadow: -4px 0 8px rgba(0,0,0,0.1); }
          20%  { transform: rotateY(-25deg);  box-shadow: -10px 0 24px rgba(0,0,0,0.2); }
          35%  { transform: rotateY(-50deg);  box-shadow: -20px 0 40px rgba(0,0,0,0.3); }
          50%  { transform: rotateY(-90deg);  box-shadow: -18px 0 36px rgba(0,0,0,0.28); }
          65%  { transform: rotateY(-128deg); box-shadow: -14px 0 28px rgba(0,0,0,0.2); }
          82%  { transform: rotateY(-158deg); box-shadow: -5px 0 12px rgba(0,0,0,0.1); }
          100% { transform: rotateY(-180deg); box-shadow: none; }
        }
        @keyframes pageTurnBackward {
          0%   { transform: rotateY(0deg);    box-shadow: none; }
          8%   { box-shadow: 4px 0 8px rgba(0,0,0,0.1); }
          20%  { transform: rotateY(25deg);   box-shadow: 10px 0 24px rgba(0,0,0,0.2); }
          35%  { transform: rotateY(50deg);   box-shadow: 20px 0 40px rgba(0,0,0,0.3); }
          50%  { transform: rotateY(90deg);   box-shadow: 18px 0 36px rgba(0,0,0,0.28); }
          65%  { transform: rotateY(128deg);  box-shadow: 14px 0 28px rgba(0,0,0,0.2); }
          82%  { transform: rotateY(158deg);  box-shadow: 5px 0 12px rgba(0,0,0,0.1); }
          100% { transform: rotateY(180deg);  box-shadow: none; }
        }
        @keyframes pageLandForward {
          0%   { transform: rotateY(-180deg); box-shadow: none; }
          18%  { box-shadow: -5px 0 12px rgba(0,0,0,0.1); }
          35%  { transform: rotateY(-128deg); box-shadow: -14px 0 28px rgba(0,0,0,0.2); }
          50%  { transform: rotateY(-90deg);  box-shadow: -18px 0 36px rgba(0,0,0,0.28); }
          65%  { transform: rotateY(-50deg);  box-shadow: -20px 0 40px rgba(0,0,0,0.3); }
          80%  { transform: rotateY(-22deg);  box-shadow: -8px 0 20px rgba(0,0,0,0.18); }
          92%  { transform: rotateY(-4deg);   box-shadow: -2px 0 6px rgba(0,0,0,0.08); }
          100% { transform: rotateY(0deg);    box-shadow: none; }
        }
        @keyframes pageLandBackward {
          0%   { transform: rotateY(180deg);  box-shadow: none; }
          18%  { box-shadow: 5px 0 12px rgba(0,0,0,0.1); }
          35%  { transform: rotateY(128deg);  box-shadow: 14px 0 28px rgba(0,0,0,0.2); }
          50%  { transform: rotateY(90deg);   box-shadow: 18px 0 36px rgba(0,0,0,0.28); }
          65%  { transform: rotateY(50deg);   box-shadow: 20px 0 40px rgba(0,0,0,0.3); }
          80%  { transform: rotateY(22deg);   box-shadow: 8px 0 20px rgba(0,0,0,0.18); }
          92%  { transform: rotateY(4deg);    box-shadow: 2px 0 6px rgba(0,0,0,0.08); }
          100% { transform: rotateY(0deg);    box-shadow: none; }
        }
        @keyframes curveShadingForward {
          0%   { background: transparent; opacity: 0; }
          15%  { background: linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.08) 80%, rgba(0,0,0,0.22) 100%); opacity: 1; }
          35%  { background: linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.38) 100%); }
          50%  { background: linear-gradient(to right, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.32) 60%, rgba(0,0,0,0.48) 100%); }
          65%  { background: linear-gradient(to left, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0) 100%); }
          85%  { background: linear-gradient(to left, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0) 100%); }
          100% { background: transparent; opacity: 0; }
        }
        @keyframes curveShadingBackward {
          0%   { background: transparent; opacity: 0; }
          15%  { background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.08) 80%, rgba(0,0,0,0.22) 100%); opacity: 1; }
          35%  { background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.38) 100%); }
          50%  { background: linear-gradient(to left, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.32) 60%, rgba(0,0,0,0.48) 100%); }
          65%  { background: linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0) 100%); }
          85%  { background: linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0) 100%); }
          100% { background: transparent; opacity: 0; }
        }
        @keyframes castShadow {
          0%   { opacity: 0; background: transparent; }
          20%  { opacity: 1; background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.14) 100%); }
          50%  { background: linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.08) 100%); }
          80%  { background: linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0) 100%); }
          100% { opacity: 0; background: transparent; }
        }
        @keyframes entranceLabel {
          0%   { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes entranceTitle {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes entranceRule {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes entranceBody {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pinDrop {
          0%   { transform: translateY(-24px) scale(0.8); opacity: 0; }
          60%  { transform: translateY(3px) scale(1.05); opacity: 1; }
          80%  { transform: translateY(-2px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        .page-corner:hover { opacity: 1; }
      `}</style>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
// All styles are inline objects so the component is fully self-contained —
// no CSS file needed, no class name conflicts with the template.

// Physical book object — literal values, "look exactly like the reference image"
const PAPER_BACK = '#ede9e2';
const INK = '#2a1f14';
const INK_LIGHT = '#6b5744';
const INK_FAINT = '#a08878';
const SPINE_ROD = '#9e5a3a';
const COVER_BORDER_END = '#b8845a';

// Ink/stamps printed on the paper — v3 accent tokens
const EXPEDITION_RED = '#8b2e1a';
const STAMP_GREEN = '#3a5c3a';
const MAP_BLUE = '#2d5986';
const TURN_ME_GREEN = '#2D6A4F';

const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
const FONT_BODY = '"Lora", Georgia, serif';
const FONT_MONO = '"Courier Prime", "Courier New", monospace';

const MOBILE_SCALE = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.72 : 1;

const styles: Record<string, React.CSSProperties> = {

  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '3rem clamp(1rem, 4vw, 3rem) 2.5rem',
    width: '100%',
    background: 'transparent',
    fontFamily: FONT_BODY,
  },

  bookFrame: {
    position: 'relative',
  },

  book: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    width: '960px',
    maxWidth: '960px',
    minWidth: '720px',
    height: '736px',
    minHeight: '565px',
    backgroundImage: `url(${journalBg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    padding: '56px 50px 56px 50px',
    boxSizing: 'border-box',
    perspective: '1800px',
    transformStyle: 'preserve-3d',
    transform: `scale(${MOBILE_SCALE})`,
    transformOrigin: 'top center',
  },

  // ── Page anatomy (shadow-receiver / back / front / curve-shadow) ──

  pageContainer: {
    position: 'relative',
    transformStyle: 'preserve-3d',
    width: '100%',
    height: '100%',
    flex: 1,
  },

  pageContainerOverlay: {
    position: 'absolute',
    inset: 0,
  },

  pageShadowReceiver: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },

  pageBack: {
    position: 'absolute',
    inset: 0,
    transform: 'rotateY(180deg)',
    backfaceVisibility: 'hidden',
    zIndex: 2,
    background: `repeating-linear-gradient(transparent, transparent 27px, rgba(100,80,60,0.07) 27px, rgba(100,80,60,0.07) 28px), ${PAPER_BACK}`,
    borderLeft: '1.5px solid rgba(180,100,80,0.12)',
    marginLeft: '28px',
  },

  pageFrontLeft: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    zIndex: 3,
    background: 'rgba(252,251,249,0.55)',
    boxShadow: 'inset -18px 0 24px -18px rgba(60,40,20,0.18), 0 0 0 1px rgba(0,0,0,0.03)',
    padding: '2rem 1.7rem',
    overflow: 'hidden',
  },

  pageFrontRight: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    zIndex: 3,
    background: 'rgba(252,251,249,0.55)',
    boxShadow: 'inset 18px 0 24px -18px rgba(60,40,20,0.18), 0 0 0 1px rgba(0,0,0,0.03)',
    padding: '2rem 1.7rem',
    overflow: 'hidden',
  },

  pageCurveShadow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 4,
  },

  pageNum: {
    position: 'absolute',
    bottom: '12px',
    fontFamily: FONT_MONO,
    fontSize: '10px',
    color: 'rgba(0, 0, 0, 0.15)',
    fontStyle: 'italic',
    zIndex: 5,
  },

  spine: {
    width: '56px',
    flexShrink: 0,
    background: 'transparent',
    zIndex: 6,
  },

  ring: {
    width: '20px',
    height: '11px',
    borderRadius: '50%',
    border: 'none',
    background: 'conic-gradient(from 200deg, #1a1410 0deg, #4a3f30 60deg, #8a7a60 100deg, #2a2218 140deg, #1a1410 200deg, #5a4d3a 260deg, #1a1410 360deg)',
    WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at center, transparent 55%, black 58%)',
    maskImage: 'radial-gradient(ellipse 60% 60% at center, transparent 55%, black 58%)',
    transform: 'perspective(40px) rotateX(12deg)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
    margin: '0 -2px',
  },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transform: `scale(${MOBILE_SCALE})`,
    transformOrigin: 'top center',
  },

  pageCorner: {
    position: 'absolute',
    width: '76px',
    height: '76px',
    zIndex: 9,
    background: 'linear-gradient(135deg, rgba(42,31,20,0.12), transparent 65%)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },

  navBtn: {
    fontFamily: FONT_MONO,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '2px',
    padding: '6px 18px',
    transition: 'border-color 0.2s, color 0.2s',
    letterSpacing: '0.04em',
  },

  dots: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },

  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    transition: 'background 0.3s',
    filter: 'invert(1) saturate(0) brightness(1.45)',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
  },

  // ── Entrance sequence (chapter label → title → rule → body → stamps) ──

  entranceLabel: {
    animation: 'entranceLabel 120ms ease 80ms both',
  },
  entranceTitle: {
    animation: 'entranceTitle 200ms ease 160ms both',
  },
  entranceRule: {
    animation: 'entranceRule 300ms ease 280ms both',
    transformOrigin: 'left',
  },
  entranceBody: {
    animation: 'entranceBody 250ms ease 400ms both',
  },
  entrancePin: {
    animation: 'pinDrop 500ms cubic-bezier(0.34,1.56,0.64,1) 550ms both',
  },

  // ── Cover stamp box ──

  coverLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    gap: '18px',
  },

  coverStampBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: `1px solid ${EXPEDITION_RED}99`,
    borderRadius: '10px',
    padding: '28px 34px',
  },

  stampHeader: {
    fontFamily: FONT_MONO,
    fontSize: '9px',
    letterSpacing: '0.3em',
    color: EXPEDITION_RED,
    textTransform: 'uppercase',
    margin: 0,
  },

  stampName: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: '28px',
    color: INK,
    margin: '12px 0 6px',
  },

  stampRule: {
    width: '120px',
    height: '1px',
    background: EXPEDITION_RED,
    opacity: 0.6,
    margin: '4px 0 12px',
  },

  stampRole: {
    fontFamily: FONT_BODY,
    fontStyle: 'italic',
    fontSize: '13px',
    color: INK_LIGHT,
    margin: '0 0 6px',
  },

  stampCompany: {
    fontFamily: FONT_MONO,
    fontSize: '10px',
    color: INK_LIGHT,
    letterSpacing: '0.04em',
    margin: '0 0 14px',
  },

  stampLocation: {
    fontFamily: FONT_MONO,
    fontSize: '9px',
    color: INK_FAINT,
    letterSpacing: '0.08em',
    margin: 0,
  },

  coverHint: {
    fontSize: '0.72rem',
    color: INK_FAINT,
    fontStyle: 'italic',
    marginTop: '4px',
  },

  // ── Chapter pages ──

  textPage: {
    height: '100%',
  },

  pageLabel: {
    fontSize: '0.68rem',
    color: INK_FAINT,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    fontFamily: FONT_MONO,
    margin: '0 0 4px',
  },

  pageTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: '1.4rem',
    fontWeight: 600,
    color: INK,
    margin: '0 0 8px',
  },

  rule: {
    width: '40px',
    height: '1px',
    background: SPINE_ROD,
    margin: '0 0 16px',
  },

  bodyText: {
    fontSize: '0.88rem',
    color: INK_LIGHT,
    lineHeight: 1.75,
    margin: '0 0 12px',
    fontFamily: FONT_BODY,
  },

  noteList: {
    listStyle: 'none',
    padding: 0,
    margin: '16px 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  photoPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },

  visaStampSlot: {
    position: 'absolute',
    top: '-6px',
    right: '-2px',
    pointerEvents: 'none',
    zIndex: 7,
  },

  photoFrame: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    background: '#fff',
    padding: '8px 8px 28px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.18), 0 8px 20px -4px rgba(0,0,0,0.25), 0 16px 32px -8px rgba(0,0,0,0.15)',
    transform: 'rotate(-2deg)',
    maxWidth: '200px',
  },

  photo: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    display: 'block',
  },

  photoCaption: {
    fontSize: '10px',
    color: INK_LIGHT,
    fontFamily: FONT_MONO,
    textAlign: 'center',
    margin: 0,
  },

  handNote: {
    fontFamily: FONT_BODY,
    fontSize: '0.82rem',
    color: INK_LIGHT,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '200px',
  },

  stampBox: {
    border: `1.5px solid ${COVER_BORDER_END}`,
    borderRadius: '2px',
    padding: '10px 16px',
    textAlign: 'center',
    transform: 'rotate(1deg)',
  },

  stampLabel: {
    fontSize: '0.72rem',
    color: INK_FAINT,
    letterSpacing: '0.1em',
    fontFamily: FONT_MONO,
    margin: '0 0 2px',
    textTransform: 'uppercase',
  },

  stampYear: {
    fontSize: '0.8rem',
    color: INK_LIGHT,
    margin: '0 0 2px',
  },

  stampDegree: {
    fontFamily: FONT_DISPLAY,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: INK,
    margin: '0 0 2px',
  },

  stampResult: {
    fontSize: '0.75rem',
    color: SPINE_ROD,
    margin: 0,
  },

  sketchBox: {
    opacity: 0.7,
    marginTop: '4px',
  },

  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '16px',
  },

  pill: {
    fontSize: '0.7rem',
    padding: '3px 10px',
    border: `1px solid ${COVER_BORDER_END}`,
    borderRadius: '2px',
    color: INK_LIGHT,
    background: '#e7e2db',
    letterSpacing: '0.04em',
    fontFamily: FONT_MONO,
  },

  toolGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '8px',
  },

  toolItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },

  toolIcon: {
    fontSize: '1.1rem',
    flexShrink: 0,
    marginTop: '2px',
  },

  toolName: {
    fontFamily: FONT_DISPLAY,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: INK,
    margin: '0 0 2px',
  },

  toolDesc: {
    fontSize: '0.78rem',
    color: INK_LIGHT,
    margin: 0,
    lineHeight: 1.4,
  },

  badgeBox: {
    marginTop: '20px',
    padding: '10px 16px',
    background: '#e7e2db',
    border: `1px solid ${COVER_BORDER_END}`,
    borderRadius: '2px',
    fontSize: '0.8rem',
    color: INK_LIGHT,
    fontStyle: 'italic',
  },
};
