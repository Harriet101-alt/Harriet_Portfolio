import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useThemeColors, withAlpha } from '../../hooks/useThemeColors';
import { lightStars, darkStars } from '../../assets/stars';
import { stickers } from '../../assets/stickers';
import StoryMapModal from '../ui/StoryMapModal';

// ─── PUNK-GIRLY ACCENT PALETTE ───────────────────────────────────────────────
// These augment the template's existing soft pink/lavender theme — they
// punch through it for tags/badges/accents, they don't replace the section's
// own light/dark background or text colours (those still come from
// useThemeColors, same as every other section).

const PUNK_PINK = '#FF1F7D';
const ACID_GREEN = '#AAFF00';
const BRUISE = '#3D1A5E';
const BLUSH = '#FFD6E8';

// Reuse the same "expedition" tones already established in FlipJournal/ExpeditionMap
const MAP_BLUE = '#2d5986';
const STAMP_GREEN = '#3a5c3a';

// Courier Prime/Playfair Display are already loaded site-wide (added for the
// expedition map + journal) — reused here rather than adding new fonts.
const FONT_MONO = '"Courier Prime", "Courier New", monospace';
const FONT_DISPLAY = '"Playfair Display", Georgia, serif';

const EASE_RESISTANCE = 'cubic-bezier(0.65, 0, 0.35, 1)';

// ─── CONTENT ─────────────────────────────────────────────────────────────────

interface WorkEntry {
  title: string;
  org: string;
  date: string;
  tags: string[];
  bullets: string[];
  impact?: string;
}

const WORK_ENTRIES: WorkEntry[] = [
  {
    title: 'Shared Services Centre Assistant',
    org: 'BDO UK LLP',
    date: 'May – June 2026',
    tags: ['DATA QUALITY'],
    bullets: [
      "BDO's SSC was migrating multi-client data into CTO2 with duplicate records and unstandardised client name strings creating downstream conflict risks",
      'Performed systematic verification across large multi-source datasets, identifying structural data quality failures; supported bot-assisted conflict checking incoming clients against the existing portfolio to surface missed conflicts before sign-off',
    ],
  },
  {
    title: 'Accounts Assistant',
    org: 'Bellway plc (FTSE 250)',
    date: 'June – Sept 2025',
    tags: ['SPATIAL', 'ESG'],
    bullets: [
      "Bellway's land acquisition pipeline required rigorous ESG risk assessment across a high-volume development portfolio",
      'Combined spatial and financial datasets, cross-referencing planning constraints, biodiversity net gain (BNG) metrics, and environmental risk layers at site level; validated BNG datasets for regulated environmental reporting, directly influencing £multi-million strategic land acquisition decisions',
    ],
    impact: 'Increased fund allocation efficiency by 15%',
  },
  {
    title: 'Sustainability Analyst',
    org: 'Voiz · Remote',
    date: 'Oct 2021 – Jan 2022',
    tags: ['EMISSIONS', 'AUTOMATION'],
    bullets: [
      'Co-developed a Scope 1, 2 & 3 emissions calculator with Cornell University and automated monthly reporting workflows via Excel/Xero integrations',
      'Reduced reporting turnaround by 5 days and established a repeatable, auditable emissions baseline for a company with no prior quantitative measurement capability',
    ],
    impact: 'Reduced reporting turnaround by 5 days',
  },
  {
    title: 'Laboratory Intern',
    org: 'Feedwater Ltd., Wirral',
    date: 'June – Sept 2018',
    tags: ['ANALYTICS'],
    bullets: [
      'Engineered an Excel dashboard for microbial treatment review with a dynamic multi-point monitoring interface improving data interpretation speed by 25%, recording 97% biocidal efficacy of bromine in water sterilisation',
    ],
    impact: 'Improved data interpretation speed by 25%',
  },
];

interface ProjectEntry {
  title: string;
  context: string;
  badge: string;
  stack: string[];
  summary: string;
  bullets: string[];
}

const PROJECT_ENTRIES: ProjectEntry[] = [
  {
    title: 'Land Acquisition Application for Residential Development',
    context: 'Esri UK Project · April 2026',
    badge: 'SPATIAL',
    stack: ['ArcGIS', 'Open Data', 'Planning'],
    summary: 'Multi-criteria spatial scoring and 3D constraint validation for residential development site selection.',
    bullets: [
      'Developed a multi-criteria site scoring application in ArcGIS integrating government open data (Housing Delivery Test scores, Land Registry house prices, Environment Agency ecological constraints, OS amenity layers) to rank candidate sites by planning permission viability',
      'Built a 3D constraint validation application using Esri tools to cross-reference proposed developments against ecological regulation boundaries, flood risk zones, and amenity proximity thresholds — enabling designers to surface conflicts prior to planning submission',
    ],
  },
  {
    title: 'Regulatory Compliance Checker',
    context: 'Pfizer Pharma Hackathon · March 2026',
    badge: 'HACKATHON WIN',
    stack: ['Next.js', 'TypeScript', 'Regulatory Review'],
    summary: 'Build-time regulatory validation pipeline for pharma digital assets.',
    bullets: [
      'Architected a Next.js pipeline that cross-references promotional drug content against regulatory guidelines at build time, surfacing non-compliant copy as flagged warnings and eliminating a class of pre-launch manual review for regulated digital assets',
    ],
  },
  {
    title: 'Distributed Task-Scheduling Architecture',
    context: 'Ultamation / Sciontech Hackathon · Feb 2026',
    badge: 'SPATIAL',
    stack: ['Python', 'CSP', 'DAG'],
    summary: 'Race condition elimination and optimal load distribution across a 500-task automation environment.',
    bullets: [
      'A 500-task, 5-server automation environment was suffering race conditions and uneven load distribution',
      'Formalised the problem as a Constraint Satisfaction Problem (CSP) and architected a DAG traversal engine with dependency-aware batching heuristics, eliminating all race conditions and reducing execution latency to the theoretical minimum for the given workload',
    ],
  },
  {
    title: 'Parts of Speech Tagging (POS)',
    context: 'MSc NLP Project · 2025',
    badge: 'RESEARCH',
    stack: ['PyTorch', 'Transformer', 'BiLSTM', 'Optuna'],
    summary: 'End-to-end clinical NLP pipeline comparing BiLSTM and Transformer architectures.',
    bullets: [
      "Engineered an end-to-end clinical NLP pipeline (BiLSTM & Transformer, PyTorch) with torchtext tokenisation and Optuna Bayesian hyperparameter optimisation — Transformer outperformed BiLSTM by 5.8% F1, attributed to self-attention's resolution of long-range dependency loss inherent in sequential hidden state compression",
    ],
  },
  {
    title: 'Geospatial Socioeconomic Analysis',
    context: 'MSc Project · Austin, TX · 2025',
    badge: 'SPATIAL',
    stack: ['QGIS', 'DBSCAN', 'GeoPandas', 'Census API'],
    summary: 'Spatial clustering to identify income inequality hotspots across Austin, TX.',
    bullets: [
      'Applied LISA spatial autocorrelation and DBSCAN clustering to Census API geodata to identify income-inequality hotspots across Austin, TX. Visualised in QGIS, demonstrating ArcGIS-equivalent workflows in open-source tooling',
    ],
  },
  {
    title: 'Obesity Classifier for Health Risk Prediction',
    context: 'MSc Project · 2025',
    badge: 'ML',
    stack: ['Python', 'Random Forest', 'Sci-kit Learn'],
    summary: 'High-accuracy Random Forest classifier on clinical records for health risk prediction.',
    bullets: [
      'Trained a Random Forest classifier on 2,111 clinical records achieving 0.96 F1 / 0.999 AUC; stratified K-Fold CV and correlation-matrix pre-processing addressed class imbalance and multicollinearity',
    ],
  },
  {
    title: 'Mapping Population Change Across Africa',
    context: 'MSc Project · 2025',
    badge: 'SPATIAL',
    stack: ['Raster', 'QGIS', 'Visualization'],
    summary: 'Geographically accurate choropleth mapping of population density change across Africa 2015–2025.',
    bullets: [
      'Reprojected raster data to equal-area CRS for geometrically accurate proportional calculations, applied accessible diverging colour schemes, and implemented tooltip interactivity for spatial exploration of population density change throughout Africa (2015–2025)',
    ],
  },
];

interface EducationEntry {
  degree: string;
  institution: string;
  result: string;
  date: string;
  stampColor: string;
  stampText: string;
  bullets: string[];
}

const EDUCATION_ENTRIES: EducationEntry[] = [
  {
    degree: 'MSc Data Science & Artificial Intelligence',
    institution: 'University of Liverpool',
    result: 'Merit',
    date: '2025 – 2026',
    stampColor: MAP_BLUE,
    stampText: 'MSC · DATA SCI & AI · 2026',
    bullets: [
      'Thesis: Stacked ensemble learning for above-ground Carbon Biomass Estimation, Rimba Raya, Indonesia. Integrated multispectral satellite imagery with field plot ecology data; built a heterogeneous stacked ensemble (RF / SVR / XGBoost + Ridge meta-model); 5-fold nested cross-validation reduced overfitting by ~6%, producing a fully reproducible Python pipeline applicable to large-scale environmental monitoring.',
    ],
  },
  {
    degree: 'BSc Ecology & Conservation',
    institution: 'Lancaster University',
    result: '2:1',
    date: '2019 – 2023',
    stampColor: STAMP_GREEN,
    stampText: 'BSC · ECOLOGY & CONS · 2023',
    bullets: [
      'Designed and executed independent ecological surveys integrating spatial data collection and statistical analysis (SPSS) across field and laboratory settings',
      'Treasurer, Lancaster Environment Centre (LEC) — managed £10,000 annual budget across 12 months ensuring financial compliance, budgeting for five society events',
    ],
  },
];

// ─── DECORATIVE / STRUCTURAL SUB-COMPONENTS ─────────────────────────────────

const TAG_ROTATIONS = [-1.5, 0.8, -0.6, 1.2, -1, 0.5];

function ZineTag({ label, index }: { label: string; index: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10.5px',
        fontFamily: FONT_MONO,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        border: `1px solid ${PUNK_PINK}`,
        borderRadius: '2px',
        color: PUNK_PINK,
        background: withAlpha(PUNK_PINK, 0.06),
        transform: `rotate(${TAG_ROTATIONS[index % TAG_ROTATIONS.length]}deg)`,
        marginRight: '6px',
        marginBottom: '6px',
      }}
    >
      {label}
    </span>
  );
}

function HackathonPill({ label, rotation }: { label: string; rotation: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        fontFamily: FONT_MONO,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '4px 11px',
        borderRadius: '999px',
        border: `1.5px solid ${PUNK_PINK}`,
        color: PUNK_PINK,
        background: '#fff',
        transform: `rotate(${rotation}deg)`,
        boxShadow: '1px 2px 0 rgba(0,0,0,0.1)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: ACID_GREEN,
          marginRight: '6px',
          verticalAlign: 'middle',
        }}
      />
      {label}
    </span>
  );
}

function CategoryPill({ label, rotation }: { label: string; rotation: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        fontFamily: FONT_MONO,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '4px 11px',
        borderRadius: '999px',
        border: `1.5px solid ${BRUISE}`,
        color: BRUISE,
        background: withAlpha(BRUISE, 0.05),
        transform: `rotate(${rotation}deg)`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function ImpactLine({ text }: { text: string }) {
  return (
    <p
      style={{
        fontFamily: FONT_MONO,
        fontSize: '12px',
        color: PUNK_PINK,
        margin: '10px 0 0',
        letterSpacing: '0.01em',
      }}
    >
      ↳ {text}
    </p>
  );
}

function EduStamp({ color, stampText, centerText, rotation }: { color: string; stampText: string; centerText: string; rotation: number }) {
  const arcId = useId();
  return (
    <svg
      viewBox="0 0 80 80"
      width="84"
      height="84"
      style={{ transform: `rotate(${rotation}deg)`, opacity: 0.65, flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="40" cy="40" r="29" fill="none" stroke={color} strokeWidth="0.7" strokeDasharray="2 3" />
      <path id={arcId} d="M 4,46 A 34,34 0 1,1 76,46" fill="none" />
      <text fontSize="5.4" fill={color} letterSpacing="0.5" fontFamily={FONT_MONO} textAnchor="middle">
        <textPath href={`#${arcId}`} startOffset="50%">{stampText}</textPath>
      </text>
      <text x="40" y="48" fontSize="9" fill={color} textAnchor="middle" fontFamily={FONT_MONO} fontWeight={700} letterSpacing="0.05em">
        {centerText.toUpperCase()}
      </text>
    </svg>
  );
}

function ExpandableEntry({
  isOpen,
  onToggle,
  header,
  body,
  cardBg,
  borderColor,
  hoverBg,
}: {
  isOpen: boolean;
  onToggle: () => void;
  header: ReactNode;
  body: ReactNode;
  cardBg: string;
  borderColor: string;
  hoverBg: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!bodyRef.current) return;
    setMaxHeight(isOpen ? `${bodyRef.current.scrollHeight}px` : '0px');
  }, [isOpen]);

  return (
    <div
      style={{
        background: hovered ? hoverBg : cardBg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: '4px',
        marginBottom: '14px',
        overflow: 'hidden',
        transition: `background ${EASE_RESISTANCE} 250ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        className="w-full text-left"
        style={{ background: 'transparent', border: 'none', padding: '16px 18px', cursor: 'pointer' }}
        aria-expanded={isOpen}
      >
        {header}
      </button>
      <div style={{ maxHeight, overflow: 'hidden', transition: `max-height 380ms ${EASE_RESISTANCE}` }}>
        <div ref={bodyRef} style={{ padding: '0 18px 18px' }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

type TabId = 'work' | 'projects' | 'education';

export default function ExperienceSection() {
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabId>('work');
  const [openWork, setOpenWork] = useState<Set<number>>(new Set([0]));
  const [openProjects, setOpenProjects] = useState<Set<number>>(new Set([0]));
  const [storyMapOpen, setStoryMapOpen] = useState(false);

  const toggle = (set: Set<number>, setter: (s: Set<number>) => void, i: number) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setter(next);
  };

  const stars = isDarkMode ? darkStars : lightStars;
  const cardBg = isDarkMode ? withAlpha(themeColors.colors.dark[800], 0.85) : withAlpha(themeColors.colors.white, 0.9);
  const cardBorder = isDarkMode ? withAlpha(BRUISE, 0.5) : themeColors.colors.pink[200];
  const cardHoverBg = isDarkMode ? withAlpha(BRUISE, 0.3) : BLUSH;

  return (
    <section
      id="experience"
      className="py-16 md:py-20 relative"
      style={{
        background: themeColors.background.sections?.experience || themeColors.background.gradient,
        transition: 'background 0.3s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes punkStarBob {
          0%, 100% { transform: translateY(0) rotate(var(--star-rot, 0deg)); }
          50% { transform: translateY(-6px) rotate(var(--star-rot, 0deg)); }
        }
        @keyframes punkTabFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .punk-tab-content { animation: punkTabFade 320ms ${EASE_RESISTANCE}; }
        .punk-tab-btn { position: relative; background: none; border: none; cursor: pointer; }
      `}</style>

      {/* Decorative star cluster around the header */}
      <img src={stars[1]} alt="" aria-hidden="true" className="absolute pointer-events-none select-none hidden md:block"
        style={{ top: '18px', left: '9%', width: '38px', ['--star-rot' as string]: '-14deg', animation: 'punkStarBob 4.2s ease-in-out infinite' }} />
      <img src={stars[4]} alt="" aria-hidden="true" className="absolute pointer-events-none select-none hidden md:block"
        style={{ top: '52px', right: '11%', width: '30px', ['--star-rot' as string]: '10deg', animation: 'punkStarBob 3.6s ease-in-out infinite 0.4s' }} />
      <img src={stars[7]} alt="" aria-hidden="true" className="absolute pointer-events-none select-none hidden md:block"
        style={{ top: '8px', right: '24%', width: '22px', ['--star-rot' as string]: '-6deg', animation: 'punkStarBob 5s ease-in-out infinite 0.8s' }} />

      <div className="container mx-auto px-6 relative" style={{ zIndex: 2 }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: PUNK_PINK,
              margin: '0 0 6px',
            }}
          >
            EXPEDITION LOG
          </p>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 600,
              color: isDarkMode ? themeColors.colors.white : themeColors.colors.pink[500],
              margin: 0,
            }}
          >
            My Experience
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-8 md:gap-10" style={{ marginBottom: '2rem' }}>
          {([
            { id: 'work' as const, label: 'Work' },
            { id: 'projects' as const, label: 'Projects' },
            { id: 'education' as const, label: 'Education' },
          ]).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="punk-tab-btn"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '6px 2px',
                  color: isActive ? PUNK_PINK : (isDarkMode ? themeColors.colors.white : themeColors.colors.dark[600]),
                  fontWeight: isActive ? 700 : 400,
                  transition: `color ${EASE_RESISTANCE} 200ms`,
                }}
              >
                {tab.label}
                <span
                  style={{
                    display: 'block',
                    height: '2px',
                    marginTop: '4px',
                    background: PUNK_PINK,
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center',
                    transition: `transform ${EASE_RESISTANCE} 250ms`,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative' }} key={activeTab} className="punk-tab-content">
          {activeTab === 'work' && (
            <div>
              {WORK_ENTRIES.map((entry, i) => (
                <ExpandableEntry
                  key={entry.title}
                  isOpen={openWork.has(i)}
                  onToggle={() => toggle(openWork, setOpenWork, i)}
                  cardBg={cardBg}
                  borderColor={cardBorder}
                  hoverBg={cardHoverBg}
                  header={
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.15rem', fontWeight: 500, color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[600], margin: 0 }}>
                          {entry.title}
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: themeColors.textSecondary, margin: '2px 0 8px' }}>{entry.org}</p>
                        <div>
                          {entry.tags.map((t, ti) => <ZineTag key={t} label={t} index={ti} />)}
                        </div>
                      </div>
                      <span style={{ fontFamily: FONT_MONO, fontSize: '11px', color: themeColors.textSecondary, whiteSpace: 'nowrap' }}>{entry.date}</span>
                    </div>
                  }
                  body={
                    <>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                        {entry.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontSize: '0.88rem', lineHeight: 1.75, color: themeColors.textPrimary, marginBottom: bi < entry.bullets.length - 1 ? '8px' : 0 }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                      {entry.impact && <ImpactLine text={entry.impact} />}
                    </>
                  }
                />
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div style={{ position: 'relative' }}>
              <img
                src={stickers[5]}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none hidden md:block"
                style={{ top: '-34px', right: '-26px', width: '64px', transform: 'rotate(8deg)' }}
              />
              {PROJECT_ENTRIES.map((entry, i) => {
                const isLandAcquisition = entry.title === 'Land Acquisition Application for Residential Development';

                if (isLandAcquisition) {
                  return (
                    <ExpandableEntry
                      key={entry.title}
                      isOpen={false}
                      onToggle={() => setStoryMapOpen(true)}
                      cardBg={cardBg}
                      borderColor={cardBorder}
                      hoverBg={cardHoverBg}
                      header={
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.15rem', fontWeight: 500, color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[600], margin: 0 }}>
                              {entry.title}
                              <span
                                title="Opens StoryMap"
                                style={{
                                  marginLeft: '8px',
                                  fontSize: '0.75rem',
                                  verticalAlign: 'middle',
                                  opacity: 0.7,
                                  fontFamily: 'monospace',
                                  color: '#FF1F7D',
                                }}
                              >
                                ↗
                              </span>
                            </h3>
                            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: themeColors.textSecondary, margin: '2px 0 8px' }}>{entry.context}</p>
                            <div>
                              {entry.stack.map((s, si) => <ZineTag key={s} label={s} index={si} />)}
                            </div>
                          </div>
                          {entry.badge === 'HACKATHON WIN'
                            ? <HackathonPill label={entry.badge} rotation={i % 2 === 0 ? -1 : 1.5} />
                            : <CategoryPill label={entry.badge} rotation={i % 2 === 0 ? -1 : 1.2} />}
                        </div>
                      }
                      body={null}
                    />
                  );
                }

                return (
                <ExpandableEntry
                  key={entry.title}
                  isOpen={openProjects.has(i)}
                  onToggle={() => toggle(openProjects, setOpenProjects, i)}
                  cardBg={cardBg}
                  borderColor={cardBorder}
                  hoverBg={cardHoverBg}
                  header={
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.15rem', fontWeight: 500, color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[600], margin: 0 }}>
                          {entry.title}
                        </h3>
                        <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: themeColors.textSecondary, margin: '2px 0 8px' }}>{entry.context}</p>
                        <div>
                          {entry.stack.map((s, si) => <ZineTag key={s} label={s} index={si} />)}
                        </div>
                      </div>
                      {entry.badge === 'HACKATHON WIN'
                        ? <HackathonPill label={entry.badge} rotation={i % 2 === 0 ? -1 : 1.5} />
                        : <CategoryPill label={entry.badge} rotation={i % 2 === 0 ? -1 : 1.2} />}
                    </div>
                  }
                  body={
                    <>
                      <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: themeColors.textSecondary, margin: '0 0 10px', fontStyle: 'italic' }}>{entry.summary}</p>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                        {entry.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontSize: '0.88rem', lineHeight: 1.75, color: themeColors.textPrimary, marginBottom: bi < entry.bullets.length - 1 ? '8px' : 0 }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </>
                  }
                />
              );
              })}
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              {EDUCATION_ENTRIES.map((entry, i) => (
                <div
                  key={entry.degree}
                  className="flex flex-col sm:flex-row items-start gap-5"
                  style={{
                    background: cardBg,
                    border: `1.5px solid ${cardBorder}`,
                    borderRadius: '4px',
                    padding: '20px',
                    marginBottom: '14px',
                  }}
                >
                  <EduStamp color={entry.stampColor} stampText={entry.stampText} centerText={entry.result} rotation={i % 2 === 0 ? -8 : 6} />
                  <div>
                    <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: '1.15rem', fontWeight: 500, color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[600], margin: 0 }}>
                      {entry.degree}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: themeColors.textSecondary, margin: '2px 0 4px' }}>{entry.institution}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: themeColors.textSecondary, letterSpacing: '0.04em', margin: '0 0 10px' }}>
                      {entry.result} · {entry.date}
                    </p>
                    {entry.bullets && (
                      <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                        {entry.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontSize: '0.85rem', lineHeight: 1.75, color: themeColors.textPrimary, marginBottom: bi < entry.bullets!.length - 1 ? '8px' : 0 }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StoryMapModal
        isOpen={storyMapOpen}
        onClose={() => setStoryMapOpen(false)}
        url="https://storymaps.arcgis.com/stories/f59512cff20a4ebeb8b14570cfbae7fa"
        title="Spatial Intelligence for Housing — Land Acquisition StoryMap"
      />
    </section>
  );
}
