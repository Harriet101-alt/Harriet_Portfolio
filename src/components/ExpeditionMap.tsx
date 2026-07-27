import { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Leaf, 
  Compass, 
  MapPin, 
  GraduationCap, 
  Info
} from 'lucide-react';
import { colors } from '../styles/colors';
import { useThemeColors, withAlpha } from '../hooks/useThemeColors';

// Define the geographical data structure
interface Destination {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  description: string;
  compactSummary: string;
  details: string[];
  hex: string;       // Exact cartographic token for SVG rendering
  x: number;         // X coordinate (symmetrical horizontal step)
  y: number;         // Y coordinate (alternating height)
}

const EXPEDITION_PALETTE = {
  paper: colors.expedition.paper,
  paperWarm: colors.expedition.paperWarm,
  ink: colors.expedition.ink,
  inkLight: colors.expedition.inkLight,
  inkFaint: colors.expedition.inkFaint,
  pencil: colors.expedition.pencil,
  stampRed: colors.expedition.stampRed,
  stampGreen: colors.expedition.stampGreen,
  mapBlue: colors.expedition.mapBlue,
  coverBorderEnd: colors.expedition.coverBorderEnd,
} as const;

const FONT_DISPLAY = colors.typography.fonts.display;
const FONT_BODY = colors.typography.fonts.body;
const FONT_MONO = colors.typography.fonts.mono;

const DESTINATIONS: Destination[] = [
  {
    id: 'liverpool-origin',
    title: 'Liverpool, UK',
    subtitle: 'Origin',
    theme: 'Home & Upbringing',
    description: 'The starting point of the expedition. A historic port city rich in culture, maritime heritage, and musical legacy, laying the foundations for a lifetime of curiosity and exploration.',
    compactSummary: 'Liverpool is the expedition origin: a culturally rich port city where curiosity, research habits, and analytical thinking first took root.',
    details: [
      'Foundations of technical curiosity and academic interest',
      'Developed love for research and analytical thinking',
      'Fostered in a vibrant cultural & scientific environment'
    ],
    hex: EXPEDITION_PALETTE.stampRed,
    x: 120,
    y: 200
  },
  {
    id: 'lancaster-uni',
    title: 'Lancaster University',
    subtitle: 'Ecology & Conservation',
    theme: 'Undergraduate Studies',
    description: 'Immersive exploration into forest ecology, biodiverse habitats, and wildlife statistics. Cultivated a robust methodology for field research, biological modeling, and statistical data collection.',
    compactSummary: 'Lancaster shaped the field-science foundation: ecology, conservation, GIS-supported fieldwork, biological modelling, and climate-impact research methods.',
    details: [
      'Earned BSc with focus on Ecological modeling and environmental systems',
      'Conducted field projects utilizing statistical GIS software',
      'Pioneered research on climatic impact variables on habitat conservation'
    ],
    hex: EXPEDITION_PALETTE.stampGreen,
    x: 360,
    y: 270
  },
  {
    id: 'kuala-lumpur',
    title: 'Kuala Lumpur, Malaysia',
    subtitle: 'TEFL',
    theme: 'International Pedagogy',
    description: 'Ventured into Southeast Asia to teach English as a Foreign Language in Kuala Lumpur. Formulated innovative bilingual curricula and nurtured cross-cultural communication leadership.',
    compactSummary: 'Kuala Lumpur added international teaching experience, bilingual curriculum design, active-learning tools, and confident cross-cultural communication.',
    details: [
      'Engineered interactive English language programs and active learning tools',
      'Navigated multicultural teamwork and adapted to dynamic urban life',
      'Developed robust public speaking, leadership, and instructional skills'
    ],
    hex: colors.pink[600],
    x: 600,
    y: 190
  },
  {
    id: 'seville-school',
    title: 'Seville, Spain',
    subtitle: 'International School',
    theme: 'Bilingual Academics',
    description: 'Relocated to beautiful Andalusia to teach at a prestigious international school. Crafted secondary school science curriculums and perfected bilingual technical teaching patterns.',
    compactSummary: 'Seville developed bilingual science teaching, physical-geography curriculum design, professional Spanish, and international mentoring experience.',
    details: [
      'Designed custom physical geography and life sciences curricula',
      'Acquired advanced proficiency in professional Spanish and pedagogical styles',
      'Mentored youth and led international school scientific committees'
    ],
    hex: EXPEDITION_PALETTE.coverBorderEnd,
    x: 840,
    y: 270
  },
  {
    id: 'liverpool-postgrad',
    title: 'University of Liverpool',
    subtitle: 'MSc Data Science & AI',
    theme: 'Postgraduate Flight',
    description: 'Returned to Liverpool to specialize in the cutting-edge fields of artificial intelligence, deep neural networks, machine learning algorithms, and high-performance technical computing.',
    compactSummary: 'Liverpool postgraduate study connects the expedition back to data science: machine learning, neural networks, Python/R workflows, and ecological monitoring research.',
    details: [
      'Mastering advanced machine learning, neural networks, and statistical physics',
      'Engineering predictive algorithms using modern Python & R scientific stacks',
      'Conducting thesis research on data science methodologies for ecological monitoring'
    ],
    hex: EXPEDITION_PALETTE.mapBlue,
    x: 1080,
    y: 200
  }
];

// Symmetrical coordinate cubic Bezier segments definitions between adjacent pins index:
// Seg 0: Pin 0 -> Pin 1, Seg 1: Pin 1 -> Pin 2, etc.
interface BezierSegment {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

const BEZIER_SEGMENTS: BezierSegment[] = [
  { 
    p0: { x: 120, y: 200 }, 
    p1: { x: 190, y: 200 }, 
    p2: { x: 290, y: 270 }, 
    p3: { x: 360, y: 270 } 
  },
  { 
    p0: { x: 360, y: 270 }, 
    p1: { x: 450, y: 270 }, 
    p2: { x: 510, y: 160 }, 
    p3: { x: 600, y: 190 } 
  },
  { 
    p0: { x: 600, y: 190 }, 
    p1: { x: 690, y: 160 }, 
    p2: { x: 750, y: 270 }, 
    p3: { x: 840, y: 270 } 
  },
  { 
    p0: { x: 840, y: 270 }, 
    p1: { x: 910, y: 270 }, 
    p2: { x: 1010, y: 200 }, 
    p3: { x: 1080, y: 200 } 
  }
];

// Helper to calculate a point on a cubic Bezier curve for coordinate (X, Y)
const getCubicBezierPoint = (seg: BezierSegment, t: number) => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * seg.p0.x + 3 * mt2 * t * seg.p1.x + 3 * mt * t2 * seg.p2.x + t3 * seg.p3.x,
    y: mt3 * seg.p0.y + 3 * mt2 * t * seg.p1.y + 3 * mt * t2 * seg.p2.y + t3 * seg.p3.y
  };
};

// Travel index progress (0 = Liverpool Origin, 4 = University of Liverpool)
const getPositionOnExpeditionPath = (progress: number) => {
  if (progress <= 0) return { x: BEZIER_SEGMENTS[0].p0.x, y: BEZIER_SEGMENTS[0].p0.y };
  if (progress >= 4) return { x: BEZIER_SEGMENTS[3].p3.x, y: BEZIER_SEGMENTS[3].p3.y };

  const segmentIndex = Math.floor(progress);
  const localT = progress - segmentIndex;
  return getCubicBezierPoint(BEZIER_SEGMENTS[segmentIndex], localT);
};

export default function ExpeditionMap() {
  const themeColors = useThemeColors();
  const isNight = themeColors.isDarkMode;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0); // value from 0 to 4
  const [walkAnimationTime, setWalkAnimationTime] = useState(0);
  const [visibleInfoIndex, setVisibleInfoIndex] = useState<number | null>(null);
   
  const targetProgressRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const mapInk = isNight ? themeColors.text.primary : colors.black;
  const mapInkMuted = isNight ? themeColors.text.secondary : colors.black;
  const mapInkFaint = isNight ? themeColors.text.tertiary : colors.black;
  const mapBorder = isNight ? withAlpha(colors.pink[300], 0.35) : withAlpha(EXPEDITION_PALETTE.pencil, 0.45);
  const mapAccent = isNight ? colors.pink[200] : colors.pink[800];
  const locationTitlePink = isNight ? themeColors.text.primary : colors.black;
  const stampAccent = isNight ? colors.pink[200] : EXPEDITION_PALETTE.stampRed;
  const gridLine = isNight ? withAlpha(colors.pink[200], 0.12) : withAlpha(EXPEDITION_PALETTE.ink, 0.1);
  const activeDestination = DESTINATIONS[activeIndex];
  const isInfoVisible = visibleInfoIndex === activeIndex;
  const infoPlacement = activeDestination.x > 880 ? 'right' : activeDestination.x < 260 ? 'left' : 'center';

  // Trigger animation loop whenever target index changes
  useEffect(() => {
    targetProgressRef.current = activeIndex;
    
    const animateMigration = () => {
      setCurrentProgress((prev) => {
        const target = targetProgressRef.current;
        const diff = target - prev;
        
        // If close enough, snap to target and clear
        if (Math.abs(diff) < 0.02) {
          return target;
        }
        
        // Travel speed adjusted to feel comfortable, adding custom leg swing time
        const step = diff > 0 ? 0.018 : -0.018;
        const nextProgress = prev + step;
        
        setWalkAnimationTime((t) => t + 0.12);
        return nextProgress;
      });
      
      animationFrameId.current = requestAnimationFrame(animateMigration);
    };

    animationFrameId.current = requestAnimationFrame(animateMigration);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [activeIndex]);

  // Is the character actively moving?
  const isMoving = Math.abs(currentProgress - activeIndex) > 0.01;

  // Determine hiker orientation (facing right or left)
  const isFlipped = useRef(false);
  useEffect(() => {
    const diff = activeIndex - currentProgress;
    if (Math.abs(diff) > 0.05) {
      isFlipped.current = diff < 0;
    }
  }, [activeIndex, currentProgress]);

  const currentCoords = getPositionOnExpeditionPath(currentProgress);
  const selectDestination = (index: number) => {
    setActiveIndex(index);
    setVisibleInfoIndex(null);
  };

  const toggleActiveInfo = () => {
    setVisibleInfoIndex((current) => (current === activeIndex ? null : activeIndex));
  };

  // Calculate dynamic hiker legs swing when moving
  const leftLegRotation = isMoving ? Math.sin(walkAnimationTime * 1.8) * 18 : 0;
  const rightLegRotation = isMoving ? Math.cos(walkAnimationTime * 1.8) * 18 : 0;
  // Small breathing bobbing up and down
  const bobbingOffset = isMoving ? Math.abs(Math.sin(walkAnimationTime * 2.0)) * 4 : Math.sin(Date.now() / 250) * 2;

  // Active Icon rendered based on Destination idx
  const getDestinationIcon = (id: string, size: number | string = 18) => {
    switch (id) {
      case 'liverpool-origin':
        return <Home size={size} />;
      case 'lancaster-uni':
        return <Leaf size={size} />;
      case 'kuala-lumpur':
        return <Compass size={size} />;
      case 'seville-school':
        return <MapPin size={size} />;
      case 'liverpool-postgrad':
        return <GraduationCap size={size} />;
      default:
        return <MapPin size={size} />;
    }
  };

  return (
    <div
      className="w-full bg-transparent flex flex-col items-center px-4 md:px-6 py-2 sm:py-3 md:py-4 antialiased transition-colors duration-700 select-none"
      style={{ color: mapInk, fontFamily: FONT_BODY }}
    >
      {/* Main Map Presentation Stage */}
      <main className="w-full max-w-[1200px] flex flex-col justify-center items-center">

        {/* Signpost: how to use the map */}
        <div className="mb-3 sm:mb-4 flex justify-center">
          <div
            className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-colors duration-700"
            style={{
              backgroundColor: withAlpha(isNight ? colors.dark[900] : EXPEDITION_PALETTE.paper, 0.72),
              borderColor: withAlpha(mapAccent, 0.5),
              color: mapAccent,
              fontFamily: FONT_MONO,
              fontWeight: 700,
            }}
          >
            <MapPin size={14} />
            Click a pin to move the explorer
          </div>
        </div>

        {/* Interactive map box */}
        <div
          id="expedition-map-canvas"
          className="w-full relative overflow-visible transition-all duration-700"
          style={{
            aspectRatio: '12 / 5.2',
            background: 'transparent',
            containerType: 'inline-size',
            containerName: 'expedition-map',
          }}
        >
          
          {/* Symmetrical Graph Paper Grid Background adapting dynamically to lighting */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none transition-all duration-700" 
            style={{ 
              backgroundImage: `radial-gradient(ellipse at 30% 45%, ${withAlpha(EXPEDITION_PALETTE.stampGreen, isNight ? 0.08 : 0.1)} 0 1px, transparent 1px), linear-gradient(to right, ${gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              opacity: 0.72
            }} 
          />

          {/* Symmetrical Interactive Map SVG Canvas overlay */}
          <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 1200 450" fill="none" xmlns="http://www.w3.org/2000/svg">
            
            {/* 1. Precise aligned path segments in cartographic stamp colours */}
            {/* Draw first path segment */}
            <path 
              d={`M ${BEZIER_SEGMENTS[0].p0.x} ${BEZIER_SEGMENTS[0].p0.y} C ${BEZIER_SEGMENTS[0].p1.x} ${BEZIER_SEGMENTS[0].p1.y}, ${BEZIER_SEGMENTS[0].p2.x} ${BEZIER_SEGMENTS[0].p2.y}, ${BEZIER_SEGMENTS[0].p3.x} ${BEZIER_SEGMENTS[0].p3.y}`} 
              stroke={activeIndex >= 1 ? EXPEDITION_PALETTE.stampRed : mapInk} 
              strokeWidth={activeIndex >= 1 ? '3' : '2'} 
              strokeDasharray="6 4" 
              className="transition-all duration-500"
              opacity={activeIndex >= 1 ? 0.95 : 0.3}
            />

            {/* Draw second segment */}
            <path 
              d={`M ${BEZIER_SEGMENTS[1].p0.x} ${BEZIER_SEGMENTS[1].p0.y} C ${BEZIER_SEGMENTS[1].p1.x} ${BEZIER_SEGMENTS[1].p1.y}, ${BEZIER_SEGMENTS[1].p2.x} ${BEZIER_SEGMENTS[1].p2.y}, ${BEZIER_SEGMENTS[1].p3.x} ${BEZIER_SEGMENTS[1].p3.y}`} 
              stroke={activeIndex >= 2 ? colors.pink[600] : mapInk} 
              strokeWidth={activeIndex >= 2 ? '3' : '2'} 
              strokeDasharray="6 4" 
              className="transition-all duration-500"
              opacity={activeIndex >= 2 ? 0.95 : 0.3}
            />

            {/* Draw third segment */}
            <path 
              d={`M ${BEZIER_SEGMENTS[2].p0.x} ${BEZIER_SEGMENTS[2].p0.y} C ${BEZIER_SEGMENTS[2].p1.x} ${BEZIER_SEGMENTS[2].p1.y}, ${BEZIER_SEGMENTS[2].p2.x} ${BEZIER_SEGMENTS[2].p2.y}, ${BEZIER_SEGMENTS[2].p3.x} ${BEZIER_SEGMENTS[2].p3.y}`} 
              stroke={activeIndex >= 3 ? EXPEDITION_PALETTE.coverBorderEnd : mapInk} 
              strokeWidth={activeIndex >= 3 ? '3' : '2'} 
              strokeDasharray="6 4" 
              className="transition-all duration-500"
              opacity={activeIndex >= 3 ? 0.95 : 0.3}
            />

            {/* Draw fourth segment */}
            <path 
              d={`M ${BEZIER_SEGMENTS[3].p0.x} ${BEZIER_SEGMENTS[3].p0.y} C ${BEZIER_SEGMENTS[3].p1.x} ${BEZIER_SEGMENTS[3].p1.y}, ${BEZIER_SEGMENTS[3].p2.x} ${BEZIER_SEGMENTS[3].p2.y}, ${BEZIER_SEGMENTS[3].p3.x} ${BEZIER_SEGMENTS[3].p3.y}`} 
              stroke={activeIndex >= 4 ? EXPEDITION_PALETTE.mapBlue : mapInk} 
              strokeWidth={activeIndex >= 4 ? '3' : '2'} 
              strokeDasharray="6 4" 
              className="transition-all duration-500"
              opacity={activeIndex >= 4 ? 0.95 : 0.3}
            />

            {/* 2. Symmetrical Pin Marker stems and label vertical lines */}
            {DESTINATIONS.map((dest, i) => {
              const dY = dest.y;
              const dX = dest.x;
              const stemColor = mapInk;
              const isActive = activeIndex === i;

              return (
                <g key={dest.id}>
                  {/* Stem line crossing the map curve to frame the card beautifully */}
                  <line 
                    x1={dX} 
                    y1={dY - 45} 
                    x2={dX} 
                    y2={dY + 12} 
                    stroke={stemColor} 
                    strokeWidth="1.2" 
                    strokeLinecap="round"
                    className="transition-all duration-300 pointer-events-none"
                    opacity={isActive ? 0.75 : 0.15}
                  />

                  {/* Tiny dot base on the exact dashed target line itself */}
                  <circle 
                    cx={dX} 
                    cy={dY} 
                    r="4" 
                    fill={isActive ? dest.hex : mapInk} 
                    className="transition-all duration-300 pointer-events-none" 
                    opacity={isActive ? 1.0 : 0.4}
                  />
                </g>
              );
            })}
          </svg>

          {/* 3. Absolute Positioned Interactive Pin Circles Over the Canvas */}
          {DESTINATIONS.map((dest, i) => {
            const isActive = activeIndex === i;
            const markerYPercentage = ((dest.y - 40) / 450) * 100; // Offset above the path to make the stem visible
            const markerXPercentage = (dest.x / 1200) * 100;

            return (
              <button
                key={dest.id}
                onClick={() => {
                  selectDestination(i);
                }}
                className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-hidden"
                style={{ 
                  top: `${markerYPercentage}%`, 
                  left: `${markerXPercentage}%` 
                }}
              >
                {/* Active pulsating beacon halo behind the pin circle */}
                {isActive && (
                  <div className={`absolute inset-0 rounded-full scale-[1.6] bg-current opacity-30 animate-pulse`} style={{ color: dest.hex }} />
                )}

                {/* Pin Circle Body with premium paper style adapting to Day/Night */}
                <div
                className={`rounded-full border flex items-center justify-center transition-all duration-500 shadow-sm hover:scale-105 ${
                   isActive ? 'scale-110 shadow-md' : ''
                }`}
                style={{
                   width: 'clamp(28px, 8cqw, 40px)',
                   height: 'clamp(28px, 8cqw, 40px)',
                   fontSize: 'clamp(0.7rem, 3.2cqw, 1rem)',
                   backgroundColor: isActive ? dest.hex : withAlpha(isNight ? colors.dark[900] : EXPEDITION_PALETTE.paper, 0.74),
                   borderColor: isActive ? mapAccent : mapBorder,
                   color: isActive ? EXPEDITION_PALETTE.paper : mapInkMuted,
                }}
                >
                  {getDestinationIcon(dest.id, '1em')}
                </div>

                {/* Quick Tooltip on Hover */}
                {!isActive && (
                  <div
                    className="absolute bottom-11 left-1/2 -translate-x-1/2 italic text-xs px-2 py-1 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-none shadow-sm border"
                    style={{
                      backgroundColor: isNight ? colors.dark[900] : EXPEDITION_PALETTE.ink,
                      borderColor: withAlpha(EXPEDITION_PALETTE.paper, 0.18),
                      color: EXPEDITION_PALETTE.paper,
                      fontFamily: FONT_BODY,
                    }}
                  >
                    {dest.title}
                  </div>
                )}
              </button>
            );
          })}

          {/* 4. Symmetrical Labels text array placed precisely below the map */}
          {DESTINATIONS.map((dest, i) => {
            const isActive = activeIndex === i;
            // Place labels 35px below the baseline of current stage height
            const textYPercentage = ((dest.y + 35) / 450) * 100;
            const textXPercentage = (dest.x / 1200) * 100;

            const isDoubleLineSub = dest.subtitle.includes('& AI');
            const mainSub = isDoubleLineSub ? 'MSc Data Science' : dest.subtitle;
            const secondarySub = isDoubleLineSub ? '& AI' : null;

            return (
              <div
                key={`${dest.id}-label`}
                className={`absolute -translate-x-1/2 text-center pointer-events-none transition-all duration-500 select-none ${
                  isActive ? 'scale-[1.03]' : 'opacity-[0.9]'
                }`}
                style={{
                  top: `${textYPercentage}%`,
                  left: `${textXPercentage}%`,
                  width: 'clamp(70px, 24cqw, 180px)'
                }}
              >
                <div
                  className={`text-xs md:text-sm leading-tight transition-colors duration-500 italic ${isActive ? 'font-bold' : ''}`}
                  style={{
                   color: locationTitlePink,
                   fontFamily: FONT_BODY,
                   fontWeight: isActive ? 800 : 700,
                   textShadow: isNight ? '0 1px 8px rgba(15, 23, 42, 0.75)' : '0 1px 0 rgba(245, 240, 232, 0.9)',
                   fontSize: 'clamp(0.65rem, 2.8cqw, 0.875rem)',
                  }}
                >
                  {dest.title}
                </div>

                <div
                  className="expedition-label-caption text-xs uppercase tracking-wider block mt-1 leading-none transition-colors duration-500"
                  style={{
                   color: mapInkFaint,
                   fontFamily: FONT_MONO,
                   fontWeight: 700,
                   textShadow: isNight ? '0 1px 8px rgba(15, 23, 42, 0.75)' : '0 1px 0 rgba(245, 240, 232, 0.9)',
                   fontSize: 'clamp(0.6rem, 2.6cqw, 0.75rem)',
                  }}
                >
                  {mainSub}
                  {secondarySub && <span className="block mt-0.5">{secondarySub}</span>}
                </div>
              </div>
            );
          })}

          {/* 5. Animated explorer interaction target */}
          <button
            type="button"
            onClick={toggleActiveInfo}
            aria-expanded={isInfoVisible}
            aria-label={`Show field note for ${activeDestination.title}`}
            className="absolute z-30 transition-all duration-75 cursor-pointer group focus:outline-hidden"
            style={{
              top: `${((currentCoords.y - 45 + bobbingOffset) / 450) * 100}%`, 
              left: `${(currentCoords.x / 1200) * 100}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.15s ease'
            }}
          >
            {!isInfoVisible && !isMoving && (
              <span
                className="absolute -top-12 left-9 flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.03]"
                style={{
                  backgroundColor: withAlpha(isNight ? colors.dark[900] : colors.white, 0.72),
                  borderColor: withAlpha(EXPEDITION_PALETTE.stampGreen, 0.55),
                  color: EXPEDITION_PALETTE.stampGreen,
                  fontFamily: FONT_MONO,
                }}
              >
                <Info size={12} />
                Click for info
                <svg
                  className="absolute -left-10 top-7 overflow-visible"
                  width="48"
                  height="34"
                  viewBox="0 0 48 34"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M46 4 C28 1 18 8 10 24"
                    stroke={EXPEDITION_PALETTE.stampGreen}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="3 4"
                  />
                  <path
                    d="M5 22 L10 29 L16 23"
                    stroke={EXPEDITION_PALETTE.stampGreen}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
            {/* Explorer marker */}
            <svg
              width="56"
              height="66"
              viewBox="0 0 56 66"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-md"
              style={{ transform: isFlipped.current ? 'scaleX(-1)' : 'scaleX(1)' }}
            >
              {/* Backpack */}
              <rect x="7" y="24" width="12" height="22" rx="3" fill={EXPEDITION_PALETTE.stampGreen} stroke={EXPEDITION_PALETTE.ink} strokeWidth="1.8" />
              <path d="M10 30 H17 M10 36 H17" stroke={withAlpha(EXPEDITION_PALETTE.paper, 0.85)} strokeWidth="1.2" strokeLinecap="round" />

              {/* Legs with boots */}
              <g style={{ transform: `rotate(${leftLegRotation}deg)`, transformOrigin: '26px 43px' }}>
                <path d="M24 42 L22 55" stroke="#6b5744" strokeWidth="4" strokeLinecap="round" />
                <path d="M18 55 H27 V60 H17 Z" fill={EXPEDITION_PALETTE.ink} />
              </g>
              <g style={{ transform: `rotate(${rightLegRotation}deg)`, transformOrigin: '33px 43px' }}>
                <path d="M33 42 L35 55" stroke="#6b5744" strokeWidth="4" strokeLinecap="round" />
                <path d="M31 55 H41 V60 H30 Z" fill={EXPEDITION_PALETTE.ink} />
              </g>

              {/* Field jacket and scarf */}
              <path d="M18 25 C20 19 36 19 39 25 L41 43 C36 47 23 47 17 43 Z" fill="#8a6240" stroke={EXPEDITION_PALETTE.ink} strokeWidth="1.8" />
              <path d="M24 25 L29 36 L35 25" stroke={EXPEDITION_PALETTE.paperWarm} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M25 24 C28 27 32 27 35 24" stroke={stampAccent} strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="24" cy="34" r="1.3" fill={EXPEDITION_PALETTE.ink} />
              <circle cx="33" cy="34" r="1.3" fill={EXPEDITION_PALETTE.ink} />

              {/* Arms */}
              <path d="M18 29 L10 39" stroke="#8a6240" strokeWidth="4" strokeLinecap="round" />
              <path d="M39 29 L47 40" stroke="#8a6240" strokeWidth="4" strokeLinecap="round" />
              <circle cx="9" cy="40" r="2.2" fill="#d7a078" stroke={EXPEDITION_PALETTE.ink} strokeWidth="0.8" />
              <circle cx="48" cy="41" r="2.2" fill="#d7a078" stroke={EXPEDITION_PALETTE.ink} strokeWidth="0.8" />

              {/* Neck, human face and hair */}
              <rect x="27" y="20" width="5" height="5" rx="1.5" fill="#d7a078" stroke={EXPEDITION_PALETTE.ink} strokeWidth="0.7" />
              <circle cx="30" cy="14" r="9" fill="#d7a078" stroke={EXPEDITION_PALETTE.ink} strokeWidth="1.3" />
              <path d="M22 12 C23 5 34 3 39 10 C35 8 30 8 24 11 Z" fill="#5c3d20" />
              <circle cx="27" cy="14" r="1.1" fill={EXPEDITION_PALETTE.ink} />
              <circle cx="33" cy="14" r="1.1" fill={EXPEDITION_PALETTE.ink} />
              <path d="M29 15.5 L28 18 H31" stroke="#8b5a3c" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M27 20 C29 22 32 22 34 20" stroke={EXPEDITION_PALETTE.ink} strokeWidth="1" strokeLinecap="round" />

              {/* Explorer hat */}
              <path d="M20 10 C20 2 40 2 40 10 Z" fill={EXPEDITION_PALETTE.paperWarm} stroke={EXPEDITION_PALETTE.ink} strokeWidth="1.2" />
              <rect x="22" y="7.5" width="16" height="2.3" rx="1" fill={stampAccent} />
              <path d="M14 11 C24 8 36 8 46 11 C48 13 47 15 44 15 C35 13 25 13 16 15 C13 15 12 13 14 11 Z" fill={EXPEDITION_PALETTE.paperWarm} stroke={EXPEDITION_PALETTE.ink} strokeWidth="1.2" />

              {!isMoving && (
                <path d="M 26 -2 L 30 -7 L 34 -2 Z" fill={stampAccent} className="animate-bounce" />
              )}
            </svg>
          </button>

          {isInfoVisible && (
            <div
              className={`absolute z-40 w-[min(285px,78vw)] rounded-lg border p-4 shadow-xl backdrop-blur-sm transition-all duration-300 ${
                infoPlacement === 'right'
                  ? '-translate-x-full'
                  : infoPlacement === 'center'
                    ? '-translate-x-1/2'
                    : ''
              }`}
              style={{
                top: `clamp(6%, ${((currentCoords.y - 125) / 450) * 100}%, 58%)`,
                left: `${(currentCoords.x / 1200) * 100}%`,
                backgroundColor: withAlpha(isNight ? colors.dark[900] : colors.white, isNight ? 0.86 : 0.78),
                borderColor: withAlpha(mapAccent, 0.52),
                color: mapInk,
                fontFamily: FONT_BODY,
              }}
              role="dialog"
              aria-label={`${activeDestination.title} field note`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em]" style={{ color: mapInkFaint, fontFamily: FONT_MONO }}>
                    Field note 0{activeIndex + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold italic leading-tight" style={{ color: locationTitlePink, fontFamily: FONT_DISPLAY }}>
                    {activeDestination.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setVisibleInfoIndex(null)}
                  className="rounded-full px-2 py-0.5 text-xs transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    border: `1px solid ${withAlpha(mapAccent, 0.4)}`,
                    color: mapAccent,
                    fontFamily: FONT_MONO,
                  }}
                  aria-label="Close field note"
                >
                  x
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                {activeDestination.compactSummary}{' '}
                <em className="font-semibold" style={{ color: mapAccent }}>
                  {activeDestination.details.slice(0, 2).join('. ')}.
                </em>
              </p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
