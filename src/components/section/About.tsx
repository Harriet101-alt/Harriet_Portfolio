import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TypewriterCarousel from '../TypewriterCarousel';
import FlipJournal from '../FlipJournal';
import ExpeditionMap from '../ExpeditionMap';
import HeroGlobe from '../HeroGlobe';
import Lanyard from '../ui/lanyard';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useThemeColors, withAlpha } from '../../hooks/useThemeColors';
import { profile1, profile2, profile3, stickers as stickerImages, whiteLily, liRedLily, darkRedLily, greenRocks, lakeMountain, tropics } from '../../assets';


const About = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nameText, setNameText] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const [, setCollageVisible] = useState(false);
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  const roles = [
    'Software Developer',
    'Geospatial Data Scientist',
  ];

  // Typewriter for the name — types once on mount, no delete/cycle
  useEffect(() => {
    const fullName = 'Harriet Fletcher';
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setNameText(fullName.slice(0, i));
      if (i >= fullName.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const profileImages = [
    { src: profile1, caption: "photo 1" },
    { src: profile2, caption: "photo 2" },
    { src: profile3, caption: "photo 3" }
  ];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!sectionRef.current) {
            ticking = false;
            return;
          }

          const rect = sectionRef.current.getBoundingClientRect();
          const sectionHeight = rect.height;
          const windowHeight = window.innerHeight;

          // Calculate how much of the section is in view
          const visibleTop = Math.max(0, -rect.top);
          const visibleBottom = Math.min(sectionHeight, windowHeight - rect.top);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          const progress = visibleHeight / windowHeight;
          setScrollProgress(Math.min(1, Math.max(0, progress)));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const stickers = [
    { id: 1, image: stickerImages[0], initialX: -180, initialY: -80, finalX: -550, finalY: -100, mobileInitialX: -120, mobileInitialY: -60, mobileFinalX: -250, mobileFinalY: -80 },
    { id: 2, image: stickerImages[1], initialX: 180, initialY: -60, finalX: 600, finalY: -250, mobileInitialX: 120, mobileInitialY: -40, mobileFinalX: 200, mobileFinalY: -120 },
    { id: 3, image: stickerImages[2], initialX: -160, initialY: 240, finalX: -200, finalY: 380, mobileInitialX: -100, mobileInitialY: 160, mobileFinalX: -120, mobileFinalY: 220 },
    { id: 4, image: stickerImages[3], initialX: 190, initialY: 260, finalX: 500, finalY: 150, mobileInitialX: 110, mobileInitialY: 180, mobileFinalX: 180, mobileFinalY: 120 },
    { id: 5, image: stickerImages[4], initialX: -200, initialY: 120, finalX: -200, finalY: -380, mobileInitialX: -130, mobileInitialY: 80, mobileFinalX: -130, mobileFinalY: -180 },
    { id: 6, image: stickerImages[5], initialX: 170, initialY: 100, finalX: 150, finalY: -360, mobileInitialX: 110, mobileInitialY: 70, mobileFinalX: 100, mobileFinalY: -160 },
    { id: 7, image: stickerImages[6], initialX: -130, initialY: -130, finalX: -450, finalY: -380, mobileInitialX: -90, mobileInitialY: -90, mobileFinalX: -200, mobileFinalY: -200 },
    { id: 8, image: stickerImages[7], initialX: 150, initialY: 200, finalX: 200, finalY: 350, mobileInitialX: 100, mobileInitialY: 140, mobileFinalX: 130, mobileFinalY: 200 },
    { id: 9, image: stickerImages[8], initialX: -140, initialY: 300, finalX: -500, finalY: 200, mobileInitialX: -90, mobileInitialY: 200, mobileFinalX: -180, mobileFinalY: 160 },
    { id: 10, image: stickerImages[9], initialX: 200, initialY: 120, finalX: 500, finalY: -380, mobileInitialX: 130, mobileInitialY: 80, mobileFinalX: 200, mobileFinalY: -180 },
    { id: 11, image: stickerImages[10], initialX: -220, initialY: -40, finalX: 600, finalY: 10, mobileInitialX: -140, mobileInitialY: -30, mobileFinalX: 220, mobileFinalY: 10 },
    { id: 12, image: stickerImages[11], initialX: 110, initialY: -180, finalX: 500, finalY: 300, mobileInitialX: 80, mobileInitialY: -120, mobileFinalX: 180, mobileFinalY: 180 },
    { id: 13, image: stickerImages[12], initialX: -120, initialY: 360, finalX: 500, finalY: -100, mobileInitialX: -80, mobileInitialY: 240, mobileFinalX: 180, mobileFinalY: -80 },
    { id: 14, image: stickerImages[13], initialX: 210, initialY: 40, finalX: -640, finalY: -220, mobileInitialX: 140, mobileInitialY: 30, mobileFinalX: -220, mobileFinalY: -140 },
    { id: 15, image: stickerImages[14], initialX: -100, initialY: 160, finalX: -400, finalY: 320, mobileInitialX: -70, mobileInitialY: 110, mobileFinalX: -150, mobileFinalY: 200 },
    { id: 16, image: stickerImages[15], initialX: 130, initialY: -100, finalX: -600, finalY: 100, mobileInitialX: 90, mobileInitialY: -70, mobileFinalX: -200, mobileFinalY: 80 },
  ];

  const getStickerStyle = (sticker: typeof stickers[0]) => {
    const progress = scrollProgress; // Direct progress for spreading effect when closer
    const isMobile = window.innerWidth < 768;
    const isVerySmall = window.innerWidth < 375; // iPhone SE and similar

    // Use mobile positioning on smaller screens
    const initialX = isMobile ? sticker.mobileInitialX : sticker.initialX;
    const initialY = isMobile ? sticker.mobileInitialY : sticker.initialY;
    const finalX = isMobile ? sticker.mobileFinalX : sticker.finalX;
    const finalY = isMobile ? sticker.mobileFinalY : sticker.finalY;

    // Further constrain for very small screens to prevent ANY horizontal overflow
    const constrainedFinalX = isVerySmall
      ? Math.max(-100, Math.min(100, finalX * 0.3))
      : isMobile
        ? Math.max(-150, Math.min(150, finalX * 0.5))
        : finalX;
    const constrainedFinalY = isVerySmall ? finalY * 0.6 : finalY * 0.8;

    const x = initialX + (constrainedFinalX - initialX) * progress;
    const y = initialY + (constrainedFinalY - initialY) * progress;
    const scale = isVerySmall ? 0.4 + (0.15 * progress) : isMobile ? 0.6 + (0.2 * progress) : 0.8 + (0.4 * progress);
    const opacity = 0.9 + (0.1 * progress);
    const rotation = progress * 20; // Add slight rotation

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      opacity,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
      willChange: 'transform, opacity',
      width: isVerySmall ? '50px' : isMobile ? '60px' : '80px',
      height: isVerySmall ? '50px' : isMobile ? '60px' : '80px',
      filter: `drop-shadow(0 4px 8px ${themeColors.effects.dropShadow})`
    };
  };

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
        position: 'absolute', top: '0%', right: '0%', zIndex: 5,
        transform: 'scaleX(-1) rotate(-5deg)',
        transformOrigin: 'top right',
      }}>
        <img src={tropics} alt="" style={{ width: '110px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
      </div>
      {/* Rocks — top-right corner only */}
      <div className="hidden md:block" style={{
        position: 'absolute', top: '3%', right: '2%', zIndex: 6,
        transform: 'scaleX(-1) rotate(-3deg)',
      }}>
        <img src={greenRocks} alt="" style={{ width: '110px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
      </div>

      {/* Hero Section */}
      <div className="py-10 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start max-w-6xl mx-auto gap-8">
            <div className="text-left w-full md:w-auto">
              <div className="ascii-container justify-start">
                <h1
                  className={isDarkMode ? 'hero-subtitle-dark' : 'hero-subtitle-light'}
                  style={{
                    fontFamily: '"Times New Roman", Georgia, serif',
                    fontWeight: 400,
                    letterSpacing: '0.04em',
                    fontSize: 'clamp(3rem, 9vw, 6.75rem)',
                    lineHeight: 0.9,
                    margin: 0,
                    color: '#000000',
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {nameText}
                  <span className="cursor" style={{ marginLeft: '0.04em', lineHeight: 1 }}>|</span>
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
                background: 'rgba(245, 240, 232, 0.94)',
                border: '1px solid rgba(236, 73, 153, 0.28)',
                borderRadius: '12px',
                padding: '16px 20px',
                maxWidth: '480px',
                marginTop: '14px',
                marginBottom: '4px',
                boxShadow: '0 18px 40px rgba(42, 31, 20, 0.12)',
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
                    color: '#000000',
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
                style={{ position: 'relative', width: '380px', minHeight: '480px', flexShrink: 0 }}
              >
                {/* ── Collage below Lanyard ──────────────────────────────────────
                    Row 1 — bridges the gap between Lanyard bottom and lily row
                    Row 2 — white lily (left) · red lily (right)          [existing]
                    Row 3 — stickers filling gap above mountain
                    Row 4 — mountain at bottom centre                     [existing]
                ──────────────────────────────────────────────────────────────── */}

                {/* Row 1 — left: tropics (moved up 100px), right: dark-red lily (behind red lily, moved up 200px) */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% - 120px)',
                  left: '3%',
                  transform: 'rotate(-9deg)',
                  zIndex: 13,
                }}>
                  <img src={tropics} alt="" style={{ width: '120px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% - 210px)',
                  right: '3%',
                  transform: 'rotate(8deg)',
                  zIndex: 12,
                }}>
                  <img src={darkRedLily} alt="" style={{ width: '105px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>

                {/* Row 2 — white lily (left) · red lily (right) */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 30px)',
                  left: '-5%',
                  transform: 'rotate(-8deg)',
                  zIndex: 14,
                }}>
                  <img src={whiteLily} alt="White lily" style={{ width: '120px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 20px)',
                  right: '-8%',
                  transform: 'rotate(6deg)',
                  zIndex: 14,
                }}>
                  <img src={liRedLily} alt="Red lily" style={{ width: '110px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>

                {/* Row 3 — stickers filling gap between lilies and mountain */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 2px)',
                  left: '-14px',
                  transform: 'rotate(-4deg)',
                  zIndex: 13,
                }}>
                  <img src={stickerImages[2]} alt="" style={{ width: '88px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>
                {/* stickerImages[5] — diagonal midpoint between tropics (bottom-left) and darkRedLily (top-right)
                    tropics centre ≈ x:71px, y:100%-60px
                    darkRedLily centre ≈ x:316px, y:100%-157px
                    midpoint → x:194px (left:40%), y:100%-109px — no x-overlap with either image */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% - 109px)',
                  left: '40%',
                  transform: 'rotate(12deg)',
                  zIndex: 13,
                }}>
                  <img src={stickerImages[5]} alt="" style={{ width: '82px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>

                {/* sticker_1 — below sticker_6 (bottom ≈ 100%-27px), above mountain (top ≈ 100%+90px)
                    left: 38% keeps it clear of white lily (left:-5%) and red lily (right:-8%) */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0px)',
                  left: '38%',
                  transform: 'rotate(-8deg)',
                  zIndex: 13,
                }}>
                  <img src={stickerImages[0]} alt="" style={{ width: '82px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>

                {/* Row 4 — mountain at bottom centre of the triangle */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 90px)',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-3deg)',
                  zIndex: 14,
                }}>
                  <img src={lakeMountain} alt="Mountain lake" style={{ width: '155px', height: 'auto', display: 'block', borderRadius: '6px', filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)' }} loading="lazy" />
                </div>

                {/* Globe — positioned between paragraph (left) and Lanyard (right) */}
                <div style={{
                  position: 'absolute',
                  left: '-80px',
                  top: '35%',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  border: '4px solid white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  overflow: 'hidden',
                  transform: 'rotate(6deg)',
                  zIndex: 18,
                }}>
                  <HeroGlobe compact />
                </div>

                {/* Lanyard — z-index 20 (above mount z-14 and globe z-18) */}
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <Lanyard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expedition Map */}
      <ExpeditionMap/>

      {/* About Section with Stickers and Journal */}
      <div className="py-8 md:py-12" style={{
        background: 'transparent'
      }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center relative min-h-[400px] md:min-h-[600px]">
            {/* Animated Stickers */}
            <div className="absolute inset-0 flex items-center justify-center">
              {stickers.map((sticker) => {
                const isVerySmall = window.innerWidth < 375;
                const isMobile = window.innerWidth < 768;
                return (
                  <img
                    key={sticker.id}
                    src={sticker.image}
                    alt=""
                    className="absolute z-10 pointer-events-none select-none"
                    style={getStickerStyle(sticker)}
                    loading={sticker.id <= 4 ? "eager" : "lazy"}
                    decoding="async"
                    width={isVerySmall ? "50" : isMobile ? "60" : "80"}
                    height={isVerySmall ? "50" : isMobile ? "60" : "80"}
                  />
                );
              })}
            </div>

            {/* About Me Journal */}
            <div className="w-full md:max-w-2xl lg:max-w-4xl relative z-20 px-1 md:px-0">
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