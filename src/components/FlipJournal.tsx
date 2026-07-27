import { useEffect, useId, useRef, useState } from 'react';
import {
  profile2,
  profile2Webp400,
  profile2Webp800,
  profile3,
  profile3Webp400,
  profile3Webp800,
  profilePlane,
  profilePlaneWebp400,
  profilePlaneWebp800,
} from '../assets';
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

// Reading text would otherwise shrink along with the desktop/tablet book
// (the book's own responsive `scale` factor, based on the 960px two-page
// spread) to the point of illegibility on narrower laptop/iPad widths.
// Counter that by growing these design-space font sizes in inverse
// proportion to `scale`, so the rendered/on-screen size stays roughly
// constant instead of shrinking with the page. Headline-style text (page
// titles, the cover name) is capped more tightly since it's a single line
// that has to fit the page's fixed width without wrapping into the next
// section.
//
// Mobile (<768px) does NOT use this: it renders a single page at a time,
// scaled against a ~402px single-page basis (see `mobileScale` below) that
// lands close to 1 on phone widths, so nominal `styles` font sizes stay
// legible with no counter-scaling needed.
const getScaledTextStyles = (scale: number) => {
  const t = Math.min(3, 1 / scale);
  const tHeadline = Math.min(1.7, t);
  return {
    ...styles,
    pageLabel: { ...styles.pageLabel, fontSize: `${0.68 * t}rem` },
    pageTitle: { ...styles.pageTitle, fontSize: `${1.4 * tHeadline}rem` },
    bodyText: { ...styles.bodyText, fontSize: `${0.88 * t}rem` },
    handNote: { ...styles.handNote, fontSize: `${0.82 * t}rem` },
    stampLabel: { ...styles.stampLabel, fontSize: `${0.72 * t}rem` },
    stampYear: { ...styles.stampYear, fontSize: `${0.8 * t}rem` },
    stampDegree: { ...styles.stampDegree, fontSize: `${0.9 * t}rem` },
    stampResult: { ...styles.stampResult, fontSize: `${0.75 * t}rem` },
    pill: { ...styles.pill, fontSize: `${0.7 * t}rem` },
    toolName: { ...styles.toolName, fontSize: `${0.85 * t}rem` },
    toolDesc: { ...styles.toolDesc, fontSize: `${0.78 * t}rem` },
    photoCaption: { ...styles.photoCaption, fontSize: `${10 * t}px` },
    badgeBox: { ...styles.badgeBox, fontSize: `${0.8 * t}rem` },
    stampHeader: { ...styles.stampHeader, fontSize: `${9 * t}px` },
    stampName: { ...styles.stampName, fontSize: `${28 * tHeadline}px` },
    stampRole: { ...styles.stampRole, fontSize: `${13 * t}px` },
    stampLocation: { ...styles.stampLocation, fontSize: `${9 * t}px` },
    coverHint: { ...styles.coverHint, fontSize: `${0.72 * t}rem` },
  };
};

const getSpreads = (scale: number, isMobile: boolean): Page[] => {
  // Mobile renders one full page at a time at close to real size (see
  // `mobileScale`), so it uses nominal font sizes directly instead of the
  // desktop/tablet counter-scale multiplier.
  const scaled = isMobile ? styles : getScaledTextStyles(scale);
  return [
  // SPREAD 0 — Cover
  {
    left: (
      <div style={styles.coverLeft}>
        <div style={styles.coverStampBox}>
          <p style={scaled.stampHeader}>FIELD NOTES</p>
          <p style={scaled.stampName}>Harriet Fletcher</p>
          <div style={styles.stampRule} />
          <p style={scaled.stampRole}>The story of my Career</p>
          <p style={scaled.stampLocation}>Liverpool &middot; 2026</p>
        </div>
      </div>
    ),
    right: (
      <div style={styles.photoPage}>
        <div style={styles.photoFrame}>
          <img src={profilePlane} srcSet={`${profilePlaneWebp400} 400w, ${profilePlaneWebp800} 800w`} sizes="200px" alt="Harriet" style={styles.photo} width="200" height="160" />
          <p style={scaled.photoCaption}>fig. 1 — I've travelled to many destinations near and far both figuratively and in actuality</p>
        </div>
      </div>
    ),
  },

  // SPREAD 1 — Roots: Ecology
  {
    left: (
      <div style={styles.textPage}>
        <p style={{ ...scaled.pageLabel, ...styles.entranceLabel }}>chapter i</p>
        <h2 style={{ ...scaled.pageTitle, ...styles.entranceTitle }}>the roots</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={scaled.bodyText}>
            Lancaster University. Before I wrote a line of code, I was
            mapping habitats, modelling populations, and learning to
            read a landscape as a system of interlocking dependencies.
          </p>
          <p style={scaled.bodyText}>
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
          <p style={scaled.stampLabel}>Lancaster University</p>
          <p style={scaled.stampYear}>2019 – 2022</p>
          <p style={scaled.stampDegree}>BSc Ecology &amp; Conservation</p>
          <p style={scaled.stampResult}>First Class Honours</p>
        </div>
        <p style={scaled.handNote}>
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
        <p style={{ ...scaled.pageLabel, ...styles.entranceLabel }}>chapter ii</p>
        <h2 style={{ ...scaled.pageTitle, ...styles.entranceTitle }}>the stream</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={scaled.bodyText}>
            MSc Data Science &amp; AI, University of Liverpool. I crossed
            from the natural world into the computational one — and found
            that the vocabulary was different but the questions were the same.
          </p>
          <p style={scaled.bodyText}>
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
            <img src={profile2} srcSet={`${profile2Webp400} 400w, ${profile2Webp800} 800w`} sizes="200px" alt="Harriet at university" style={styles.photo} width="200" height="160" />
            <p style={scaled.photoCaption}>fig. 2 — somewhere between the data and the deadline</p>
          </div>
        </div>
        <div style={{ ...styles.stampBox, ...styles.entrancePin, marginTop: '12px' }}>
          <p style={scaled.stampLabel}>University of Liverpool</p>
          <p style={scaled.stampYear}>2022 – 2023</p>
          <p style={scaled.stampDegree}>MSc Data Science &amp; AI</p>
        </div>
      </div>
    ),
  },

  // SPREAD 3 — Developer skills
  {
    left: (
      <div style={styles.textPage}>
        <p style={{ ...scaled.pageLabel, ...styles.entranceLabel }}>chapter iii</p>
        <h2 style={{ ...scaled.pageTitle, ...styles.entranceTitle }}>the clearing</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={scaled.bodyText}>
            Junior Developer at Pfizer via Jakala. TypeScript, React,
            Python, FastAPI — the stack I'm building fluency in. I care
            about writing code that is efficient, readable, and does
            exactly one thing well.
          </p>
          <p style={scaled.bodyText}>
            My particular interest: automation and applied AI. If a
            process runs twice it should run itself. If a gap exists
            between what a system does and what it should do, I want
            to close it.
          </p>
          <div style={{ ...styles.pillRow, ...styles.entrancePin }}>
            {['TypeScript','React','Python','FastAPI','Git','PostgreSQL'].map(s => (
              <span key={s} style={scaled.pill}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    right: (
      <div style={styles.textPage}>
        <p style={{ ...scaled.pageLabel, ...styles.entranceLabel }}>tools &amp; interests</p>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={{ ...styles.toolGrid, ...styles.entranceBody }}>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>⚙️</span>
            <div>
              <p style={scaled.toolName}>Automation</p>
              <p style={scaled.toolDesc}>Remove friction from repeated processes</p>
            </div>
          </div>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>🏗️</span>
            <div>
              <p style={scaled.toolName}>Data architecture</p>
              <p style={scaled.toolDesc}>Structure before syntax, always</p>
            </div>
          </div>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>🌍</span>
            <div>
              <p style={scaled.toolName}>Geospatial AI</p>
              <p style={scaled.toolDesc}>QGIS, H3, Deck.gl, satellite data</p>
            </div>
          </div>
          <div style={styles.toolItem}>
            <span style={styles.toolIcon}>🤖</span>
            <div>
              <p style={scaled.toolName}>LLM integration</p>
              <p style={scaled.toolDesc}>RAG pipelines, prompt engineering</p>
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
        <p style={{ ...scaled.pageLabel, ...styles.entranceLabel }}>chapter iv</p>
        <h2 style={{ ...scaled.pageTitle, ...styles.entranceTitle }}>the signal fire</h2>
        <div style={{ ...styles.rule, ...styles.entranceRule }} />
        <div style={styles.entranceBody}>
          <p style={scaled.bodyText}>
            I secured this role by winning a website deployment hackathon.
            Not because I knew everything — but because I shipped something
            when it mattered, and it worked.
          </p>
          <p style={scaled.bodyText}>
            I don't come from a traditional dev background. I came from
            field notes and data models. That background is the thing
            I'd least want to change.
          </p>
          <div style={{ ...scaled.badgeBox, ...styles.entrancePin }}>
            🏆 &nbsp; Website deployment hackathon — placed
          </div>
        </div>
      </div>
    ),
    right: (
      <div style={styles.photoPage}>
        <div style={styles.entrancePin}>
          <div style={styles.photoFrame}>
            <img src={profile3} srcSet={`${profile3Webp400} 400w, ${profile3Webp800} 800w`} sizes="200px" alt="Harriet" style={styles.photo} width="200" height="160" />
            <p style={scaled.photoCaption}>fig. 3 — ready to build things that matter</p>
          </div>
        </div>
        <p style={scaled.handNote}>
          harrietfletcherool@gmail.com<br />
          github.com/Harriet101-alt
        </p>
        <div style={styles.sketchBox}>
          <svg viewBox="0 0 180 80" width="180" height="80">
            <text x="10" y="20" fontSize="11" fill="#7a6652" fontFamily="Georgia, serif">roots → trunk → canopy</text>
            <line x1="10" y1="30" x2="170" y2="30" stroke="#c4a882" strokeWidth="0.8" strokeDasharray="4,3"/>
            <text x="10" y="48" fontSize="10" fill="#9e8470" fontFamily="Georgia, serif">ecology → data → code</text>
            <text x="10" y="68" fontSize="10" fill="#b89d82" fontFamily="Georgia, serif">the same shape, different scale</text>
          </svg>
        </div>
        <p style={{ ...scaled.coverHint, marginTop: '8px' }}>← end of field notes</p>
      </div>
    ),
  },
  ];
};

// ─── PAGE LAYER ──────────────────────────────────────────────────────────────
// The 4-layer DOM anatomy of a single page surface (shadow receiver / back
// face / front face / curve shading), shared by static, outgoing and
// incoming page instances.

interface PageLayerProps {
  content: React.ReactNode;
  pageNumber: number;
  side: 'left' | 'right';
  // 'static'   → a flat, non-rotating sheet (the resting page, or the
  //              destination page revealed flat beneath a lifting sheet).
  // 'lifting'  → the single sheet that rotates about the spine for this turn.
  variant: 'static' | 'lifting';
  direction?: Direction;
  showCastShadow?: boolean;
  reduceMotion?: boolean;
  // Mobile's single-page-at-a-time layout has no adjacent page to gutter
  // toward, so it opts out of the desktop/tablet spine-side inset shadow
  // (`pageFrontLeft`/`pageFrontRight`) in favour of a plain flat front face.
  flat?: boolean;
  // Mobile lets an individual page scroll internally when its content is
  // taller than the viewport at ~1x scale, instead of the desktop
  // "clip and rely on the fixed 736px book height" behaviour.
  contentOverflow?: 'hidden' | 'auto';
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

function PageLayer({ content, pageNumber, side, variant, direction, showCastShadow, reduceMotion, flat, contentOverflow }: PageLayerProps) {
  const isLeft = side === 'left';

  // The hinge is ALWAYS the spine (gutter edge of this slot): the lifting
  // sheet pivots there, the free outer edge leads the motion. A flat static
  // sheet never rotates, so its origin is irrelevant (kept centred).
  const transformOrigin =
    variant === 'lifting'
      ? direction === 'forward'
        ? 'left center'
        : 'right center'
      : 'center';

  let turnAnimation: string | undefined;
  let curveAnimation: string | undefined;

  if (variant === 'lifting' && !reduceMotion) {
    const turnName = direction === 'forward' ? 'pageTurnForward' : 'pageTurnBackward';
    const curveName = direction === 'forward' ? 'curveShadingForward' : 'curveShadingBackward';
    turnAnimation = `${turnName} ${TURN_DURATION}ms ${TURN_EASING} both`;
    curveAnimation = `${curveName} ${TURN_DURATION}ms ${TURN_EASING} both`;
  }

  return (
    <div
      style={{
        ...styles.pageContainer,
        // The lifting sheet is an absolute overlay so it can rotate above the
        // flat destination sheet revealed beneath it. Crucially this is now
        // contained by its own half-width slot (pageSlot), so inset:0 and the
        // transform-origin resolve to the slot's gutter — NOT the whole book.
        ...(variant === 'lifting' ? styles.pageContainerOverlay : null),
        transformOrigin,
        animation: turnAnimation,
        // Only the lifting sheet sits above the static underlay during a turn.
        zIndex: variant === 'lifting' ? 8 : 'auto',
      }}
    >
      <div
        style={{
          ...styles.pageShadowReceiver,
          animation: showCastShadow && !reduceMotion ? `castShadow ${TURN_DURATION}ms ease both` : undefined,
        }}
      />
      <div style={styles.pageBack} />
      <div
        key={`${side}-${pageNumber}`}
        style={{
          ...(flat ? styles.pageFrontFlat : isLeft ? styles.pageFrontLeft : styles.pageFrontRight),
          overflow: contentOverflow ?? 'hidden',
        }}
      >
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

// A full turn is ONE sheet rotating 0 → ±180° about the spine. The keyframe
// %-steps below are deliberately non-uniform: the sheet accelerates as it
// passes vertical (gravity helping it over the top) and decelerates as the
// free edge settles onto the opposite stack. The JS swap fires at exactly
// TURN_DURATION so the static spread takes over the instant the rotation ends.
const TURN_DURATION = 750;
const TURN_EASING = 'cubic-bezier(0.645, 0.045, 0.355, 1.000)';

// Mobile single-page design-space dimensions — one page's worth of the
// desktop book (960x736 minus its 56/50px padding, halved) rather than the
// full two-page spread. Also doubles as the whole-page tap-zone size.
const MOBILE_PAGE_WIDTH = 402;
const MOBILE_PAGE_HEIGHT = 624;

// The same-spread (left<->right) mobile transition is a slide/crossfade,
// not a page turn (see the comment on `mobileBook`/`mobileSlideLayer` —
// there's no physical spine between two halves of an already-open spread).
// Kept quick and light relative to TURN_DURATION's full page-turn feel.
const MOBILE_SLIDE_DURATION = 260;

export default function FlipJournal() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [journalVisible, setJournalVisible] = useState(false);
  const [dismissedForward, setDismissedForward] = useState(false);
  const [dismissedBack, setDismissedBack] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Book is authored at a fixed 960x736 "design" size and visually shrunk via
  // transform: scale() to fit narrower viewports. The lazy initializer only
  // avoids a flash of the full-size book on first paint on mobile — the real,
  // reactive value comes from the ResizeObserver below.
  const [scale, setScale] = useState(() =>
    typeof window !== 'undefined' ? Math.min(1, window.innerWidth / 960) : 1
  );
  // iPhone-only layout: one full page at a time (not a shrunk two-page
  // spread), navigated via whole-page tap zones instead of the desktop's
  // per-corner zones. 768 matches the same mobile/desktop split used
  // elsewhere in this app (e.g. StickerCorkboard's tier breakpoint) —
  // desktop/laptop/iPad are unaffected by any of this.
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  // Mobile's own scale basis: a single page's design width (402px) rather
  // than the two-page spread's 960px, so it lands close to 1 on phone
  // widths (375/402 ≈ 0.93) instead of desktop `scale`'s ≈0.39 — see the
  // comment on `getScaledTextStyles` above for why that matters.
  const [mobileScale, setMobileScale] = useState(() =>
    typeof window !== 'undefined' ? Math.min(1, window.innerWidth / MOBILE_PAGE_WIDTH) : 1
  );
  // Which half of `currentSpread` mobile is currently showing. Reading
  // order is a flat sequence: spread0.left → spread0.right → spread1.left
  // → … Desktop ignores this entirely (it always shows both halves).
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left');
  // In-flight same-spread (left<->right) slide transition — mobile only.
  // Cross-spread transitions reuse `flip`/`goTo` below instead.
  const [slide, setSlide] = useState<{ direction: Direction } | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const spreads = getSpreads(scale, isMobile);
  const total = spreads.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setJournalVisible(true); },
      { threshold: 0.15 }
    );
    if (wrapperRef.current) obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  // Reactive sizing: the book's own width/height are fixed (960x736) and
  // scaled down via transform, so the wrapper's real available width (driven
  // by the About.tsx mount container's responsive max-width classes) is what
  // must set the scale — not a one-shot window.innerWidth check at module
  // load, which never re-ran on resize/rotation and wasn't small enough for
  // phone-width viewports anyway.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(Math.min(1, w / 960));
        setMobileScale(Math.min(1, w / MOBILE_PAGE_WIDTH));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // `nextMobileSide`: once a cross-spread turn lands, which half of the new
  // spread mobile should be showing (desktop callers never pass this).
  function goTo(direction: Direction, nextMobileSide?: 'left' | 'right') {
    if (flip) return;
    if (direction === 'forward' && currentSpread >= total - 1) return;
    if (direction === 'back' && currentSpread <= 0) return;

    if (direction === 'forward') setDismissedForward(true);
    if (direction === 'back') setDismissedBack(true);

    const toSpread = direction === 'forward' ? currentSpread + 1 : currentSpread - 1;
    setFlip({ direction, fromSpread: currentSpread, toSpread });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Reduced motion: skip the rotation, commit the new spread immediately
    // so the end state is correct without any oscillating motion.
    timeoutRef.current = setTimeout(() => {
      setCurrentSpread(toSpread);
      setFlip(null);
      if (nextMobileSide) setMobileSide(nextMobileSide);
    }, reduceMotion ? 0 : TURN_DURATION);
  }

  // Mobile forward/back: flat half-page sequence (spread.left → spread.right
  // → nextSpread.left → …). Same-spread transitions are a quick slide (no
  // spine to turn over); crossing a spread boundary reuses `goTo`'s existing
  // page-turn machinery, then lands on the appropriate half of the new spread.
  function mobileGoForward() {
    if (flip || slide) return;
    setDismissedForward(true);
    if (mobileSide === 'left') {
      setSlide({ direction: 'forward' });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setMobileSide('right');
        setSlide(null);
      }, reduceMotion ? 0 : MOBILE_SLIDE_DURATION);
    } else {
      if (currentSpread >= total - 1) return;
      goTo('forward', 'left');
    }
  }

  function mobileGoBack() {
    if (flip || slide) return;
    setDismissedBack(true);
    if (mobileSide === 'right') {
      setSlide({ direction: 'back' });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setMobileSide('left');
        setSlide(null);
      }, reduceMotion ? 0 : MOBILE_SLIDE_DURATION);
    } else {
      if (currentSpread <= 0) return;
      goTo('back', 'right');
    }
  }

  // Clean up any pending swap timer on unmount.
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const spread = spreads[currentSpread];
  const outgoingSpread = flip ? spreads[flip.fromSpread] : null;
  const incomingSpread = flip ? spreads[flip.toSpread] : null;
  const isTurningRight = flip?.direction === 'forward';
  const isTurningLeft = flip?.direction === 'back';

  // Mobile cross-spread turn: forward leaves the current spread's right
  // page and lands on the next spread's left page; backward leaves the
  // current spread's left page and lands on the previous spread's right
  // page (the flat half-page reading order — see `mobileGoForward/Back`).
  const mobileOutSide: 'left' | 'right' = flip?.direction === 'forward' ? 'right' : 'left';
  const mobileInSide: 'left' | 'right' = flip?.direction === 'forward' ? 'left' : 'right';

  // Whether a forward/backward move is possible at all right now, at
  // mobile's half-page granularity or desktop's spread granularity —
  // drives the "Turn Me"/"Go backwards" hints, the bottom nav buttons, and
  // the mobile progress label consistently.
  const canGoForward = isMobile ? mobileSide === 'left' || currentSpread < total - 1 : currentSpread < total - 1;
  const canGoBack = isMobile ? mobileSide === 'right' || currentSpread > 0 : currentSpread > 0;
  const mobilePageIndex = currentSpread * 2 + (mobileSide === 'left' ? 0 : 1);

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      {/* SVG paper-grain filter definition — zero size, never visible */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.025 0" />
        </filter>
      </svg>
      {/* Journal book — bookFrame is a plain 2D stacking box so the corner/
          whole-page touch zones below sit reliably above book's 3D
          perspective context */}
      <div style={{
        position: 'relative',
        display: 'inline-block',
        width: isMobile ? MOBILE_PAGE_WIDTH * mobileScale : 960 * scale,
        height: isMobile ? MOBILE_PAGE_HEIGHT * mobileScale : 736 * scale,
      }}>
      <div style={styles.bookFrame}>
      {isMobile ? (
        /* ── MOBILE: single page at a time ──────────────────────────────
            One full-size page instead of a shrunk two-page spread. A
            same-spread (left<->right) move is a quick slide/crossfade (no
            spine between them); crossing a spread boundary reuses the
            book's page-turn rotation via `flip`, on whichever single side
            is actually leaving/arriving (see `mobileOutSide`/`mobileInSide`
            above). */
        <div style={{ ...styles.mobileBook, transform: `scale(${mobileScale})` }}>
          {flip && outgoingSpread && incomingSpread ? (
            <>
              <PageLayer
                content={incomingSpread[mobileInSide]}
                pageNumber={flip.toSpread * 2 + (mobileInSide === 'left' ? 1 : 2)}
                side={mobileInSide}
                variant="static"
                flat
                contentOverflow="auto"
              />
              <PageLayer
                content={outgoingSpread[mobileOutSide]}
                pageNumber={flip.fromSpread * 2 + (mobileOutSide === 'left' ? 1 : 2)}
                side={mobileOutSide}
                variant="lifting"
                direction={flip.direction}
                reduceMotion={reduceMotion}
                flat
                contentOverflow="auto"
              />
            </>
          ) : slide ? (
            slide.direction === 'forward' ? (
              <>
                <div
                  key={`slide-out-${currentSpread}-left`}
                  style={{
                    ...styles.mobileSlideLayer,
                    animation: reduceMotion ? undefined : `mobileSlideOutForward ${MOBILE_SLIDE_DURATION}ms ease both`,
                  }}
                >
                  {spread.left}
                </div>
                <div
                  key={`slide-in-${currentSpread}-right`}
                  style={{
                    ...styles.mobileSlideLayer,
                    animation: reduceMotion ? undefined : `mobileSlideInForward ${MOBILE_SLIDE_DURATION}ms ease both`,
                  }}
                >
                  {spread.right}
                </div>
              </>
            ) : (
              <>
                <div
                  key={`slide-out-${currentSpread}-right`}
                  style={{
                    ...styles.mobileSlideLayer,
                    animation: reduceMotion ? undefined : `mobileSlideOutBackward ${MOBILE_SLIDE_DURATION}ms ease both`,
                  }}
                >
                  {spread.right}
                </div>
                <div
                  key={`slide-in-${currentSpread}-left`}
                  style={{
                    ...styles.mobileSlideLayer,
                    animation: reduceMotion ? undefined : `mobileSlideInBackward ${MOBILE_SLIDE_DURATION}ms ease both`,
                  }}
                >
                  {spread.left}
                </div>
              </>
            )
          ) : (
            <PageLayer
              content={spread[mobileSide]}
              pageNumber={currentSpread * 2 + (mobileSide === 'left' ? 1 : 2)}
              side={mobileSide}
              variant="static"
              flat
              contentOverflow="auto"
            />
          )}
        </div>
      ) : (
      <div style={{ ...styles.book, transform: `scale(${scale})` }}>

        {/* ── LEFT SLOT ──────────────────────────────────────────────────
            A back turn lifts the LEFT sheet: the destination left page sits
            flat beneath, the current left page rides the single rotating
            sheet that pivots on the spine (right edge of this slot) and
            sweeps left→right onto the right side. Every other case the left
            page is a single flat, static sheet. */}
        <div style={styles.pageSlot}>
          {isTurningLeft && flip && outgoingSpread && incomingSpread ? (
            <>
              {/* Destination page, revealed flat beneath the lifting sheet */}
              <PageLayer
                content={incomingSpread.left}
                pageNumber={flip.toSpread * 2 + 1}
                side="left"
                variant="static"
              />
              {/* The one sheet that actually rotates this turn */}
              <PageLayer
                content={outgoingSpread.left}
                pageNumber={flip.fromSpread * 2 + 1}
                side="left"
                variant="lifting"
                direction={flip.direction}
                reduceMotion={reduceMotion}
              />
            </>
          ) : (
            <PageLayer
              content={spread.left}
              pageNumber={currentSpread * 2 + 1}
              side="left"
              variant="static"
              showCastShadow={isTurningRight}
              reduceMotion={reduceMotion}
            />
          )}
        </div>

        {/* Spiral binding — absolutely positioned SVG overlay */}
        <SpiralBinding bookHeight={736} topPad={56} botPad={56} />

        {/* Spine spacer — keeps flex layout gap between pages */}
        <div style={styles.spine} />

        {/* ── RIGHT SLOT ─────────────────────────────────────────────────
            A forward turn lifts the RIGHT sheet: the destination right page
            sits flat beneath, the current right page rides the single
            rotating sheet that pivots on the spine (left edge of this slot)
            and sweeps right→left onto the left side. Every other case the
            right page is a single flat, static sheet. */}
        <div style={styles.pageSlot}>
          {isTurningRight && flip && outgoingSpread && incomingSpread ? (
            <>
              {/* Destination page, revealed flat beneath the lifting sheet */}
              <PageLayer
                content={incomingSpread.right}
                pageNumber={flip.toSpread * 2 + 2}
                side="right"
                variant="static"
              />
              {/* The one sheet that actually rotates this turn */}
              <PageLayer
                content={outgoingSpread.right}
                pageNumber={flip.fromSpread * 2 + 2}
                side="right"
                variant="lifting"
                direction={flip.direction}
                reduceMotion={reduceMotion}
              />
            </>
          ) : (
            <PageLayer
              content={spread.right}
              pageNumber={currentSpread * 2 + 2}
              side="right"
              variant="static"
              showCastShadow={isTurningLeft}
              reduceMotion={reduceMotion}
            />
          )}
        </div>
      </div>
      )}

      {isMobile ? (
        <>
          {/* Whole-page tap-to-turn (iPhone only) — left half of the single
              visible page goes back, right half goes forward, sized to the
              mobile page itself (no book padding/spine math needed, since
              there's no two-page spread here). */}
          <div
            role="button"
            aria-label="Previous page"
            onClick={mobileGoBack}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${(MOBILE_PAGE_WIDTH / 2) * mobileScale}px`,
              height: `${MOBILE_PAGE_HEIGHT * mobileScale}px`,
              zIndex: 9,
              cursor: canGoBack ? 'pointer' : 'default',
            }}
          />
          <div
            role="button"
            aria-label="Next page"
            onClick={mobileGoForward}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: `${(MOBILE_PAGE_WIDTH / 2) * mobileScale}px`,
              height: `${MOBILE_PAGE_HEIGHT * mobileScale}px`,
              zIndex: 9,
              cursor: canGoForward ? 'pointer' : 'default',
            }}
          />
        </>
      ) : (
        <>
          {/* Corner touch zones — sit outside book's 3D/perspective context
              so they stack reliably above the page content; offsets match
              book's border thickness (18px 20px 22px 19px = top right
              bottom left) */}
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
              // Bottom-left hard to hit as a tiny corner nub — sized to a full
              // quadrant (half the page's own 402x624 design width/height) so it
              // covers 25% of the page area. Positioned via `top`, not `bottom`:
              // this zone sits outside book's own transform, in `bookFrame`,
              // whose box keeps the book's *unscaled* 736px design height (only
              // its width tracks `scale`, since the outer sizing div constrains
              // width but not height — a block's height:auto doesn't fill a
              // parent's explicit height the way width:auto fills its width).
              // `top` still lines up with the book's rendered top edge at any
              // scale (transform-origin is top-anchored), but `bottom` measures
              // from that phantom unscaled 736px frame — on a shrunk mobile
              // book that put this zone hundreds of px below the real page.
              // left stays raw/unscaled too, for the same reason it always has
              // on the sibling corners: bookFrame's *width* does track `scale`.
              top: `${(736 - 22 - 312) * scale}px`,
              left: '19px',
              width: `${201 * scale}px`,
              height: `${312 * scale}px`,
              cursor: currentSpread === 0 ? 'default' : 'pointer',
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
              // `bottom` here suffered the same phantom-736px-frame bug as the
              // bottom-left zone above (see that comment) — badly misaligned
              // below the real page on any non-desktop scale. `top` tracks
              // correctly since it's measured from the book's actual rendered
              // top edge regardless of scale.
              top: `${(736 - 22 - 76) * scale}px`,
              right: '20px',
              cursor: currentSpread === total - 1 ? 'default' : 'pointer',
              clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
            }}
          />
        </>
      )}

      </div>{/* end bookFrame */}

      {/* Forward "Turn Me" hint — below-right of book, arrow points up into right corner */}
      {journalVisible && !dismissedForward && canGoForward && (
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
          <div style={{ fontFamily: '"DK Crayonista", "Courier Prime", "Courier New", monospace', fontSize: '18px', color: TURN_ME_GREEN, lineHeight: 1.2, transform: 'rotate(3deg)', transformOrigin: 'right top' }}>
            {'Turn Me'.split('').map((ch, i) => (
              <span key={i} style={{ display: 'inline-block', opacity: 0, animation: `journalWriteChar 0.08s ease-out ${i * 45}ms both` }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Backward "Go backwards" hint — below-left of book, arrow points up into left corner */}
      {journalVisible && !dismissedBack && canGoBack && (
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
          <div style={{ fontFamily: '"DK Crayonista", "Courier Prime", "Courier New", monospace', fontSize: '18px', color: TURN_ME_GREEN, lineHeight: 1.2, transform: 'rotate(-3deg)', transformOrigin: 'left top' }}>
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
      <div style={{ ...styles.nav, transform: `scale(${isMobile ? mobileScale : scale})` }}>
        <button
          style={{
            ...styles.navBtn,
            opacity: canGoBack ? 1 : 0.25,
            cursor: canGoBack ? 'pointer' : 'not-allowed',
          }}
          onClick={isMobile ? mobileGoBack : () => goTo('back')}
          disabled={!canGoBack}
          aria-label="Previous page"
        >
          ← prev
        </button>

        <div style={styles.dots}>
          {/* Mobile navigates at half-page granularity, so its dots (and
              the progress label below) reflect that instead of the
              coarser per-spread position desktop uses — otherwise the
              indicator would silently under-report progress on mobile. */}
          {(isMobile ? Array.from({ length: total * 2 }) : spreads).map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                background: i === (isMobile ? mobilePageIndex : currentSpread) ? '#8b6f47' : '#d4c4ae',
              }}
            />
          ))}
        </div>

        <button
          style={{
            ...styles.navBtn,
            opacity: canGoForward ? 1 : 0.25,
            cursor: canGoForward ? 'pointer' : 'not-allowed',
          }}
          onClick={isMobile ? mobileGoForward : () => goTo('forward')}
          disabled={!canGoForward}
          aria-label="Next page"
        >
          next →
        </button>
      </div>

      <p
        aria-live="polite"
        style={{
          textAlign: 'center',
          marginTop: '6px',
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {isMobile ? `page ${mobilePageIndex + 1} of ${total * 2}` : `spread ${currentSpread + 1} of ${total}`}
      </p>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes journalWriteChar {
          from { opacity: 0; transform: translateY(3px) scale(0.7) rotate(-6deg); }
          to   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        /* Mobile same-spread (left<->right) slide — a look toward the other
           half of the already-open spread, not a page turn (see the
           comment on mobileSlideLayer above). */
        @keyframes mobileSlideOutForward {
          from { transform: translateX(0);      opacity: 1; }
          to   { transform: translateX(-14px);  opacity: 0; }
        }
        @keyframes mobileSlideInForward {
          from { transform: translateX(14px);   opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
        }
        @keyframes mobileSlideOutBackward {
          from { transform: translateX(0);      opacity: 1; }
          to   { transform: translateX(14px);   opacity: 0; }
        }
        @keyframes mobileSlideInBackward {
          from { transform: translateX(-14px);  opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
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
    display: 'flex',
    justifyContent: 'center',
  },

  book: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    flexShrink: 0,
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
    transformOrigin: 'top center',
  },

  // Mobile single-page book — one page's worth of design space (402x624,
  // matching the two-page book's per-page dimensions once its 56/50px
  // padding is subtracted) instead of the full 960x736 two-page spread.
  // Scaled via `mobileScale` (basis 402, not 960) so it lands close to 1 on
  // phone widths — see the comment on `mobileScale` in the component body.
  mobileBook: {
    position: 'relative',
    width: '402px',
    height: '624px',
    perspective: '1800px',
    transformStyle: 'preserve-3d',
    transformOrigin: 'top center',
    borderRadius: '4px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)',
    background: PAPER_BACK,
  },

  // A single flat/sliding layer for the same-spread (left<->right) mobile
  // transition — no rotation, just a short slide + crossfade (see the
  // `mobileSlide*` keyframes), since there's no physical spine between the
  // two halves of an already-open spread.
  mobileSlideLayer: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(252,251,249,0.55)',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.03)',
    padding: '2rem 1.7rem',
    overflowY: 'auto',
  },

  // ── Page anatomy (shadow-receiver / back / front / curve-shadow) ──

  // A half-width slot. Both the flat resting sheet and any lifting sheet for
  // this side live INSIDE this slot, so their inset/transform-origin resolve
  // to the slot's own gutter — not the whole book. This is what guarantees
  // a single sheet turns about the spine rather than the book folding.
  pageSlot: {
    position: 'relative',
    flex: 1,
    height: '100%',
    transformStyle: 'preserve-3d',
  },

  pageContainer: {
    position: 'absolute',
    inset: 0,
    transformStyle: 'preserve-3d',
    width: '100%',
    height: '100%',
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

  // Mobile single-page front face — no adjacent page, so no gutter-side
  // inset shadow (see `flat` on PageLayer).
  pageFrontFlat: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    zIndex: 3,
    background: 'rgba(252,251,249,0.55)',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.03)',
    padding: '2rem 1.7rem',
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
    aspectRatio: '5 / 4',
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
