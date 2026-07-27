import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TypewriterCarousel from '../TypewriterCarousel';
import FlipJournal from '../FlipJournal';
import ExpeditionMap from '../ExpeditionMap';
import HeroGlobe from '../HeroGlobe';
import Lanyard from '../ui/lanyard';
import StickerCorkboard, { type CorkboardStickerData } from '../StickerCorkboard';
import ScatterOnScroll from '../ScatterOnScroll';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useThemeColors, withAlpha } from '../../hooks/useThemeColors';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { Z_LAYERS } from '../../lib/zLayers';
import {
  profile1,
  profile1Webp400,
  profile1Webp800,
  profile2,
  profile2Webp400,
  profile2Webp800,
  profile3,
  profile3Webp400,
  profile3Webp800,
  stickers as stickerImages,
  whiteLily,
  liRedLily,
  darkRedLily,
  greenRocks,
  lakeMountain,
  lakeMountainWebp320,
  lakeMountainWebp640,
  tropics,
} from '../../assets';

const FIRST_NAME = 'Harriet';
const LAST_NAME = 'Fletcher';
const FULL_NAME = `${FIRST_NAME} ${LAST_NAME}`;

const About = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nameText, setNameText] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const [, setCollageVisible] = useState(false);
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  // Drives the hero collage's scatter-on-scroll effect — identical hook to
  // the one StickerCorkboard uses for the stickers behind the journal.
  const scrollProgress = useScrollProgress(collageRef);

  const roles = [
    'Software Developer',
    'Geospatial Data Scientist',
  ];

  // Typewriter for the name — types once on mount, no delete/cycle
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setNameText(FULL_NAME.slice(0, i));
      if (i >= FULL_NAME.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const profileImages = [
    { src: profile1, srcSet: `${profile1Webp400} 400w, ${profile1Webp800} 800w`, caption: "photo 1" },
    { src: profile2, srcSet: `${profile2Webp400} 400w, ${profile2Webp800} 800w`, caption: "photo 2" },
    { src: profile3, srcSet: `${profile3Webp400} 400w, ${profile3Webp800} 800w`, caption: "photo 3" }
  ];

  // IntersectionObserver to trigger collage animation
  useEffect(() => {
    if (!collageRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCollageVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(collageRef.current);
    return () => observer.disconnect();
  }, []);

  // Focus management for modal
  useEffect(() => {
    if (showProfileModal) {
      // Focus the modal when it opens
      const timer = setTimeout(() => {
        const modal = document.querySelector('[role="region"][aria-label="Profile photo carousel"]') as HTMLElement;
        if (modal) {
          modal.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showProfileModal]);

  // Carousel navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? profileImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === profileImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'Escape') {
      setIsClosing(true);
      setTimeout(() => {
        setShowProfileModal(false);
        setIsClosing(false);
      }, 300);
    }
  };

  // Resting layout for the corkboard — each sticker gets a fixed spot plus
  // a small drag radius (see StickerCorkboard), so it can be nudged around
  // like a pinned photo without ever wandering off its patch of board.
  //
  // Scattered in a loose ring above/below the book with a zig-zag radius
  // (alternating near/far) and irregular spacing, rather than tidy aligned
  // rows — reads as pinned-on-a-corkboard clutter, not a grid. Clearing a
  // rectangle only needs enough clearance on ONE axis, so `y` (not a large
  // polar radius) is what keeps each sticker off the book: magnitudes stay
  // ≥390px, clearing the book's real top/bottom edge (measured at 365/321px
  // from centre at lg+, the tallest render) with margin. `x` stays within
  // ±300 so it still fits the tightest non-mobile case (iPad portrait,
  // ~360px row half-width). The flex row around this board now carries
  // extra py-* padding specifically so this ring has room to sit in
  // without bleeding into the expedition map above or Projects below.
  // `mobileX/mobileY` are the same idea sized for the real iPhone range
  // (~375-430px) — no side clearance exists there once the book fills the
  // viewport, so every sticker lives above or below it, never beside it.
  const stickers: CorkboardStickerData[] = [
    // ── Above the book — zig-zag radius, uneven spacing ──
    { id: 1, image: stickerImages[0], x: -300, y: -405, mobileX: -150, mobileY: -232 },
    { id: 2, image: stickerImages[1], x: -250, y: -455, mobileX: -115, mobileY: -250 },
    { id: 3, image: stickerImages[2], x: -155, y: -390, mobileX: -70, mobileY: -228 },
    { id: 4, image: stickerImages[3], x: -60, y: -450, mobileX: -15, mobileY: -248 },
    { id: 5, image: stickerImages[4], x: 45, y: -395, mobileX: 30, mobileY: -230 },
    { id: 6, image: stickerImages[5], x: 145, y: -460, mobileX: 75, mobileY: -252 },
    { id: 7, image: stickerImages[6], x: 250, y: -400, mobileX: 115, mobileY: -234 },
    { id: 8, image: stickerImages[7], x: 300, y: -445, mobileX: 150, mobileY: -246 },
    // ── Below the book — zig-zag radius, uneven spacing ──
    { id: 9, image: stickerImages[8], x: -300, y: 425, mobileX: -150, mobileY: 228 },
    { id: 10, image: stickerImages[9], x: -235, y: 385, mobileX: -110, mobileY: 248 },
    { id: 11, image: stickerImages[10], x: -135, y: 440, mobileX: -65, mobileY: 230 },
    { id: 12, image: stickerImages[11], x: -40, y: 395, mobileX: -20, mobileY: 250 },
    { id: 13, image: stickerImages[12], x: 50, y: 445, mobileX: 25, mobileY: 232 },
    { id: 14, image: stickerImages[13], x: 155, y: 400, mobileX: 70, mobileY: 246 },
    { id: 15, image: stickerImages[14], x: 250, y: 450, mobileX: 115, mobileY: 228 },
    { id: 16, image: stickerImages[15], x: 300, y: 410, mobileX: 150, mobileY: 244 },
  ];

  return (
    <section id="about" ref={sectionRef} className="min-h-screen" style={{
      position: 'relative',
      background: themeColors.background.sections?.about || themeColors.background.gradient,
      transition: 'background 0.3s ease-in-out',
      width: '100%',
      maxWidth: '100vw',
      contain: 'layout style',
    }}>

      {/* ── Corner decorations (desktop only) ─────────────────────────── */}
      {/* Tropics — top-right corner only */}
      <div className="hidden md:block" style={{
        position: 'absolute', top: '0%', right: '0%', zIndex: Z_LAYERS.background,
        transform: 'scaleX(-1) rotate(-5deg)',
        transformOrigin: 'top right',
      }}>
        <img src={tropics} alt="" style={{ width: '110px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="110" height="110" sizes="110px" />
      </div>
      {/* Rocks — top-right corner only */}
      <div className="hidden md:block" style={{
        position: 'absolute', top: '3%', right: '2%', zIndex: Z_LAYERS.background,
        transform: 'scaleX(-1) rotate(-3deg)',
      }}>
        <img src={greenRocks} alt="" style={{ width: '110px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="110" height="110" sizes="110px" />
      </div>

      {/* Hero Section */}
      <div className="py-10 md:py-20">
        {/* Not Tailwind's `container` utility here on purpose: `container`
            caps width at fixed steps per breakpoint (768px for the whole
            768–1023px range, jumping to 1024px only at the `lg` breakpoint)
            — regardless of how much wider the actual viewport is within that
            range. The hero row's content (text column + gap + the
            fixed-width, non-shrinking collage) needs more room than 768px
            provides, which is exactly why the collage got squeezed toward —
            and past — its own right edge specifically in that range. `w-full
            max-w-[1536px]` scales continuously with the viewport instead
            (identical to `container` at ≥1536px, its own 2xl cap; strictly
            more room below that, fixing the squeeze). */}
        <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start max-w-6xl mx-auto gap-8">
            <div className="text-left w-full md:w-auto">
              <div className="ascii-container justify-start">
                <h1
                  className={isDarkMode ? 'hero-subtitle-dark' : 'hero-subtitle-light'}
                  style={{
                    fontFamily: '"Inter", Georgia, sans-serif',
                    fontWeight: 400,
                    letterSpacing: '0.04em',
                    fontSize: 'clamp(3rem, 9vw, 6.75rem)',
                    lineHeight: 0.9,
                    margin: 0,
                    color: themeColors.text.primary,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* "Harriet" / "Fletcher" stacked on two lines instead of one
                      nowrap line — the single-line heading measured ~910px
                      wide, forcing the text column that wide too (since it
                      sizes to its widest child), which pushed the whole flex
                      row past its own max-w-6xl bound and shoved the collage
                      off to the right. Stacking cuts the heading's width
                      roughly in half, so the row fits within its own bounds
                      and the collage sits where flexbox actually intends it,
                      further left, instead of overflowing past the row. */}
                  <span style={{ display: 'flex', alignItems: 'baseline' }}>
                    {nameText.slice(0, FIRST_NAME.length)}
                    {nameText.length <= FIRST_NAME.length && (
                      <span className="cursor" style={{ marginLeft: '0.04em', lineHeight: 1 }}>|</span>
                    )}
                  </span>
                  {nameText.length > FIRST_NAME.length && (
                    <span style={{ display: 'flex', alignItems: 'baseline' }}>
                      {nameText.slice(FIRST_NAME.length + 1)}
                      <span className="cursor" style={{ marginLeft: '0.04em', lineHeight: 1 }}>|</span>
                    </span>
                  )}
                </h1>
              </div>
              <div className="hero-subtitle justify-start text-base md:text-lg lg:text-xl mt-2">
                <div className="flex flex-wrap items-center justify-start">
                  <span className={isDarkMode ? 'hero-subtitle-dark' : 'hero-subtitle-light'}>I am a&nbsp;</span>
                  <TypewriterCarousel roles={roles} className={isDarkMode ? 'hero-subtitle-dark' : 'hero-subtitle-light'} />
                </div>
              </div>
              {/* About Me text — parchment card matching the explorer theme */}
              <div style={{
                background: isDarkMode ? 'rgba(2, 6, 23, 0.9)' : 'rgba(245, 240, 232, 0.94)',
                border: `1px solid ${isDarkMode ? 'rgba(234, 190, 195, 0.36)' : 'rgba(236, 73, 153, 0.28)'}`,
                borderRadius: '12px',
                padding: '16px 20px',
                maxWidth: '480px',
                marginTop: '14px',
                marginBottom: '4px',
                boxShadow: isDarkMode
                  ? '0 18px 40px rgba(2, 6, 23, 0.36)'
                  : '0 18px 40px rgba(42, 31, 20, 0.12)',
              }}>
                {[
                  "I am a Junior Developer from Liverpool, graduating with an MSc in Data Science and Artificial Intelligence in July. I studied Ecology and Conservation BSc(Hons) which taught me to read complex ecosystems before ever reading code. This instinct shapes how I approach the problems I encounter.",
                  "I apply AI to automate repetitive processes, freeing up space for the project elements requiring a human mind. I'm drawn to the craft of building thoughtful, usable interfaces and to the quieter work of supporting geographical research using computational methodology.",
                  "More recently, I've been utilising GIS, where my environmental background and engineering skills intersect.",
                  "I am motivated by novel challenges and believe that education is a lifelong endeavour.",
                  "Whether it be working in academia or industry; I'm comfortable letting curiosity lead the way.",
                ].map((text, i, arr) => (
                  <p key={i} style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.85,
                    color: isDarkMode ? themeColors.text.secondary : '#000000',
                    marginBottom: i < arr.length - 1 ? '1.1rem' : 0,
                    fontFamily: '"Lora", Georgia, serif',
                  }}>{text}</p>
                ))}
              </div>

              <div className="hero-buttons flex justify-start gap-3 mt-4">
                <button
                  className="hero-action-btn text-sm md:text-base px-4 py-2 md:px-5 md:py-2.5"
                  onClick={() => {
                    window.open('/Harriet_Fletcher_CV.pdf', '_blank');
                  }}
                >
                  CV →
                </button>
                <Link
                  to="/contact"
                  className="hero-action-btn text-sm md:text-base px-4 py-2 md:px-5 md:py-2.5"
                >
                  Contact →
                </Link>
              </div>
              {/* 3D Globe sticker is positioned absolutely on the section below */}
            </div>

            {/* ── Right column: Lanyard + surrounding polaroids + mount ── */}
            <div className="hidden md:flex items-start justify-start">
              <div
                ref={collageRef}
                style={{
                  position: 'relative',
                  width: '380px',
                  // 905px is driven by the Lanyard card, not the mountain.
                  // Measured live (the card's minHeight constant of 425px is
                  // NOT its real rendered height — actual content pushes it
                  // to 531.5px): the card starts at root_top(0) + ANCHOR(13)
                  // + STRAP(320) + CLIP(18) = 351px (see the Lanyard wrapper
                  // comment below — STRAP_LENGTH absorbed the 140px that used
                  // to be a `top` offset here, so this 351px is unchanged
                  // from before) and is 531.5px tall, so its real bottom edge
                  // is 351 + 531.5 = 882.5px. +22.5px margin = 905px.
                  // (Everything else — row1-4 stickers, frozen from the old
                  // `calc(100% + Npx)` pattern to plain pixel `top` values —
                  // still bottoms out well inside this at ≤753px, unaffected
                  // by the Lanyard's move.)
                  minHeight: '905px',
                  flexShrink: 0,
                  marginLeft: '60px',
                  isolation: 'isolate',
                }}
              >
                {/* ── Collage below Lanyard ──────────────────────────────────────
                    Row 1 — bridges the gap between Lanyard bottom and lily row
                    Row 2 — white lily (left) · red lily (right)          [existing]
                    Row 3 — stickers filling gap above mountain
                    Row 4 — mountain at bottom centre                     [existing]
                ──────────────────────────────────────────────────────────────── */}

                {/* Every decorative item below scatters outward on scroll,
                    identical to the corkboard stickers behind the journal —
                    same useScrollProgress hook (fed by this same collageRef),
                    same ScatterOnScroll wrapper, same radiate-from-centre
                    math. centerX/centerY = each item's own centre minus the
                    collage's centre (190, 452.5 — half of 380×905), so they
                    fly outward away from the middle of the board rather than
                    all sliding the same direction. */}

                {/* Row 1 — left: tropics (moved up 100px), right: dark-red lily (behind red lily, moved up 200px)
                    ⚠️ tropics (x:[-28.6,91.4], y:[440,560]) sits fully inside the
                    card's real box (x:[-110,203], y:[351,882.5]) — it renders
                    behind the card (z-index) either way. Pre-existing, not
                    caused by this move; flagging rather than silently leaving
                    it stranded — not repositioned here since it's out of this
                    pass's scope. darkRedLily (x:[223.6,328.6]) is clear: its
                    left edge (223.6) is right of the card's new right edge
                    (203), whereas before the card moved left it briefly
                    overlapped (card used to reach x=263). */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '440px', left: 'calc(3% - 40px)', zIndex: Z_LAYERS.stickers + 3 }}
                  rotateDeg={-9}
                  centerX={-158.6}
                  centerY={47.5}
                  scrollProgress={scrollProgress}
                  seed={1}
                >
                  <img src={tropics} alt="" style={{ width: '120px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="120" height="120" sizes="120px" />
                </ScatterOnScroll>
                {/* right: was 'calc(3% + 40px)' (inset 51.4px from the
                    collage's own right edge). Measured live at the narrowest
                    width this collage renders at (768px, the md breakpoint
                    floor — see the sticker-fix note by stickerImages[5]
                    below for why 768px is the binding case): this was
                    clipping ~4px past the viewport edge. +9px of inset
                    clears the viewport with ~5px margin, and also pulls its
                    left edge from x≈203.6 to x≈214.6 — comfortably past the
                    card's real right edge (203) instead of grazing it. */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '350px', right: 'calc(3% + 49px)', zIndex: Z_LAYERS.stickers + 2 }}
                  rotateDeg={8}
                  centerX={77.1}
                  centerY={-23.75}
                  scrollProgress={scrollProgress}
                  seed={2}
                >
                  <img src={darkRedLily} alt="" style={{ width: '105px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="105" height="105" sizes="105px" />
                </ScatterOnScroll>

                {/* Row 2 — white lily, mountain, red lily.
                    First attempt at "evenly spread across the full width"
                    put mountain and white lily almost entirely BEHIND the
                    card (verified with a real screenshot, not assumed) —
                    the card's real footprint (313×531.5px) covers x:[-110,
                    203], which is most of this 380px-wide container, so a
                    span evenly distributed across the full width mostly
                    lands inside it. True even spacing while keeping all
                    three actually visible isn't geometrically possible here
                    (their combined width, 385px, exceeds the container's own
                    380px, and the two usable side gaps — 167px to the left
                    of the card, 119px to the right, before hitting either
                    the heading or the 768px-viewport-safe edge — can't fit
                    120+155+110px without at least one item touching the
                    card). This is the closest balance: white lily and red
                    lily fully clear in the two side gaps; mountain (the
                    widest, 155px, doesn't fit either gap alone) takes a
                    small, deliberate, minimised overlap with the card's
                    right edge instead of the near-total hiding from the
                    first attempt. */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '680px', left: '-240px', zIndex: Z_LAYERS.stickers + 4 }}
                  rotateDeg={-8}
                  centerX={-189}
                  centerY={277.5}
                  scrollProgress={scrollProgress}
                  seed={3}
                >
                  <img src={whiteLily} alt="White lily" style={{ width: '120px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="120" height="120" sizes="120px" />
                </ScatterOnScroll>
                {/* left:210px — clears the card's real right edge (203) by
                    7px, and stays within the 768px-viewport-safe max right
                    edge (~322px, collage-relative) with margin. Fully
                    visible, no overlap with mountain below (different top). */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '680px', left: '210px', zIndex: Z_LAYERS.stickers + 4 }}
                  rotateDeg={6}
                  centerX={65.4}
                  centerY={290}
                  scrollProgress={scrollProgress}
                  seed={4}
                >
                  <img src={liRedLily} alt="Red lily" style={{ width: '110px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="110" height="110" sizes="110px" />
                </ScatterOnScroll>

                {/* Row 3 — pulled up into the collage's upper half. All three
                    sit well above the card's top (351px) so none of this
                    row is affected by the Lanyard's move. */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '230px', left: '-150px', zIndex: Z_LAYERS.stickers + 3 }}
                  rotateDeg={-4}
                  centerX={-296}
                  centerY={-178}
                  scrollProgress={scrollProgress}
                  seed={5}
                >
                  <img src={stickerImages[2]} alt="" style={{ width: '88px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </ScatterOnScroll>
                {/* Pancake — was top:60px, left:225px, which sat directly on
                    top of the Lanyard's "click here" affordance (measured
                    live: click-here at collage-relative x:[218.9,297.26],
                    y:[109.18,153.68]; this sticker's box at x:[213.8,318.2],
                    y:[52.7,183.4] — near-total overlap). The card's z-index
                    (50) is above this sticker's (33), so "click here" was
                    still technically painting on top, but illegibly, against
                    a busy same-toned photo. Moved to top:20px, left:100px —
                    x:[100,182], comfortably clear of the click-here region
                    (x≥218.9) and still well clear of the card (y-max 136 <
                    card top 351) and the globe's new position below. */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '20px', left: '100px', zIndex: Z_LAYERS.stickers + 3 }}
                  rotateDeg={12}
                  centerX={-49}
                  centerY={-374.5}
                  scrollProgress={scrollProgress}
                  seed={6}
                >
                  <img src={stickerImages[5]} alt="" style={{ width: '82px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </ScatterOnScroll>

                <ScatterOnScroll
                  style={{ position: 'absolute', top: '195px', left: '230px', zIndex: Z_LAYERS.stickers + 3 }}
                  rotateDeg={-8}
                  centerX={81}
                  centerY={-222.5}
                  scrollProgress={scrollProgress}
                  seed={7}
                >
                  <img src={stickerImages[0]} alt="" style={{ width: '82px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </ScatterOnScroll>

                {/* Row 4 — mountain. At 155px wide it's too wide for either
                    side gap alone (167px left / 119px right — see the row-2
                    comment above), so it takes the small deliberate overlap:
                    left:165px → x:[165,320]. Only [165,203] (38px, ~25% of
                    its width) sits behind the card's real right edge (203);
                    the rest (203–320) is clear, and 320 stays inside the
                    768px-viewport-safe max (~322px). top:780px — a different
                    band from the white/red lily (680px) so it doesn't
                    collide with red lily's box (left:210px) despite the
                    x-ranges overlapping. Bottom edge (780+103=883) sits
                    right at the card's own real bottom (882.5) and 22px
                    inside the container's 905px minHeight. */}
                <ScatterOnScroll
                  style={{ position: 'absolute', top: '780px', left: '165px', zIndex: Z_LAYERS.stickers + 4 }}
                  rotateDeg={-3}
                  centerX={-40}
                  centerY={329}
                  scrollProgress={scrollProgress}
                  seed={8}
                >
                  <img src={lakeMountain} srcSet={`${lakeMountainWebp320} 320w, ${lakeMountainWebp640} 640w`} sizes="155px" alt="Mountain lake" style={{ width: '155px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" width="155" height="103" />
                </ScatterOnScroll>

                {/* Globe — moved to the spot circled in feedback: up and
                    left of the strap (which sits at collage-relative
                    x:[35,58]), roughly level with the pancake sticker
                    (top:20px, left:100px) rather than down at the card's
                    height. New box: left:-125px, top:50px → x:[-125,25],
                    y:[50,200].
                      vs strap (x:[35,58]): globe's right edge (25) is 10px
                      clear of the strap's left edge (35).
                      vs card (x:[-110,203], y:[351,882.5]): globe's y-max
                      (200) is 151px clear of the card's top (351) — zero
                      overlap regardless of x, same rule as before.
                      vs heading "Fletcher" (collage-relative x up to
                      ≈-277, per its cursor's measured position): globe's
                      left edge (-125) is 152px clear of that — nowhere
                      near the heading text despite moving right. */}
                <ScatterOnScroll
                  style={{ position: 'absolute', left: '-125px', top: '50px', zIndex: Z_LAYERS.stickers + 8 }}
                  rotateDeg={6}
                  centerX={-355}
                  centerY={-201.5}
                  scrollProgress={scrollProgress}
                  seed={9}
                >
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '4px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                  }}>
                    <HeroGlobe compact />
                  </div>
                </ScatterOnScroll>

                {/* Lanyard — always topmost within the section.
                    top: 0 — the anchor now sits at the true top of this
                    collage container (which aligns with the top of the hero
                    row), so the rope visibly runs the full distance down to
                    the card instead of floating with a gap above it. The
                    140px that used to live here as a `top` offset (pushing
                    anchor+strap+clip+card down together) has moved into
                    lanyard.tsx's STRAP_LENGTH constant (180 → 320) instead,
                    so the card lands at the exact same spot as before:
                      old: root_top(140) + ANCHOR(13) + STRAP(180) + CLIP(18) = 351
                      new: root_top(0)   + ANCHOR(13) + STRAP(320) + CLIP(18) = 351  ✓ unchanged
                    left: -140px is unchanged from before — only the vertical
                    offset moved.
                    Its rendered box, in this container's coordinates:
                      root:  left -140px, top 0px, width 373px, height 786px
                             (height grew by the same 140px the strap grew:
                             ANCHOR 13 + STRAP 320 + CLIP 18 + CARD_HEIGHT
                             (nominal) 425 + 10 = 786; root BOTTOM is still
                             0+786=786, same as before (140+646=786) — the
                             card doesn't move, so nothing downstream
                             (collage minHeight, sticker positions) needs to
                             change either.)
                      card:  centred in that root → x:[-110, 203], y:[351, 882.5]
                             (unchanged from before — CARD_WIDTH 313 centred
                             in the 373px root, so local x:[30,343]; card
                             starts after anchor+strap+clip = 351px; card
                             height is its REAL measured 531.5px, not the
                             425px minHeight constant — see the collage
                             container's minHeight comment above)
                    position:absolute + explicit top/left (rather than
                    marginTop/marginLeft on a position:relative box) avoids
                    margin collapsing with the container, so this position is
                    exact and computable, not just visually approximate. */}
                <div style={{ position: 'absolute', zIndex: Z_LAYERS.idCard, top: '0px', left: '-140px' }}>
                  <Lanyard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expedition Map — isolated so its internal 0–40 z-index range (topo
          pattern, trail, pins, tooltips) can never be compared against, or
          collide with, the hero collage's or corkboard's own layers. */}
      <div id="expedition-map" data-section="expedition-map" style={{ position: 'relative', isolation: 'isolate' }}>
        <ExpeditionMap/>
      </div>

      {/* About Section with Stickers and Journal */}
      <div className="py-8 md:py-12" style={{
        background: 'transparent'
      }}>
        <div className="container mx-auto px-4 md:px-6">
          {/* StickerCorkboard fills this row via absolute inset:0, so the
              row's own box IS the sticker's coordinate space. Without extra
              padding here the row shrinks to exactly the journal's height,
              leaving each sticker only the journal's own ~48-88px wrapper
              padding to sit in before the row itself ends — nowhere near
              enough room, so the resting ring bled into the expedition map
              above and the projects section below. This padding reserves
              real space around the journal for the ring to live in.
              StickerCorkboard's own container clips with overflow:hidden,
              so the scroll-linked slide-away effect is cropped at this
              row's edge rather than bleeding into neighbouring sections —
              this padding no longer needs to budget extra room for it.
              Per-breakpoint values differ because the journal's own
              rendered size (and therefore how much of this row it already
              fills on its own) differs a lot between iPad portrait/
              landscape and desktop, even though they share one `stickers`
              coordinate set. */}
          <div className="flex items-center justify-center relative min-h-[400px] md:min-h-[600px] py-32 md:py-56 lg:py-36">
            {/* Corkboard stickers — tiltable, hoverable, draggable within a
                small per-sticker radius (see StickerCorkboard). Isolated
                stacking context of its own, so it can never end up above
                the journal regardless of viewport. */}
            <StickerCorkboard stickers={stickers} />

            {/* About Me Journal */}
            <div id="flip-journal" data-section="flip-journal" className="w-full md:max-w-2xl lg:max-w-4xl relative px-1 md:px-0" style={{ zIndex: Z_LAYERS.content }}>
              <FlipJournal />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          style={{ backgroundColor: themeColors.background.overlay }}
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setShowProfileModal(false);
              setIsClosing(false);
            }, 300);
          }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className={`relative w-full max-w-sm md:max-w-md ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`} onClick={(e) => e.stopPropagation()}>
            {/* Carousel Container */}
            <div
              className="relative w-full bg-black rounded-lg shadow-2xl overflow-hidden focus:outline-none"
              style={{
                aspectRatio: '4/5',
                minHeight: '300px',
                maxHeight: '80vh'
              }}
              role="region"
              aria-label="Profile photo carousel"
              aria-live="polite"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              {/* Image Display */}
              <div className="relative w-full h-full flex items-center justify-center">
                {profileImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes="(max-width: 768px) 100vw, 448px"
                    alt={`Profile photo ${index + 1}`}
                    className={`absolute w-full h-full object-contain transition-opacity duration-500 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="eager"
                    onError={(e) => {
                      console.error('Image failed to load:', image.src);
                      e.currentTarget.style.display = 'block';
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-300"
                style={{
                  backgroundColor: isDarkMode ? withAlpha(themeColors.colors.dark[700], 0.9) : withAlpha(themeColors.colors.white, 0.8),
                  color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
                  border: isDarkMode ? '2px solid #374151' : 'none',
                  boxShadow: isDarkMode ? `0 4px 12px ${withAlpha(themeColors.colors.black, 0.6)}` : undefined
                } as React.CSSProperties}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-300"
                style={{
                  backgroundColor: isDarkMode ? withAlpha(themeColors.colors.dark[700], 0.9) : withAlpha(themeColors.colors.white, 0.8),
                  color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
                  border: isDarkMode ? '2px solid #374151' : 'none',
                  boxShadow: isDarkMode ? `0 4px 12px ${withAlpha(themeColors.colors.black, 0.6)}` : undefined
                } as React.CSSProperties}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {profileImages.length}
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-base font-medium max-w-[220px] text-center">
                {profileImages[currentImageIndex].caption}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-0 mt-4">
              {profileImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 flex items-center justify-center"
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '0',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  } as React.CSSProperties}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <span
                    className="rounded-full transition-all"
                    style={{
                      width: index === currentImageIndex ? '32px' : '12px',
                      height: '12px',
                      backgroundColor: index === currentImageIndex ? themeColors.colors.pink[300] : (isDarkMode ? withAlpha(themeColors.colors.pink[300], 0.3) : themeColors.colors.dark[300])
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white rounded-full w-11 h-11 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
              style={{ 
                backgroundColor: themeColors.colors.pink[500],
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.colors.pink[600]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors.colors.pink[500]}
              aria-label="Close modal"
              onClick={(e) => {
                e.stopPropagation();
                setIsClosing(true);
                setTimeout(() => {
                  setShowProfileModal(false);
                  setIsClosing(false);
                }, 300);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;