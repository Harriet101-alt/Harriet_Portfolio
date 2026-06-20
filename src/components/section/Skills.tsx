import { useRef } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { useThemeColors } from "../../hooks/useThemeColors";

const Skills = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const skills = [
    'Python',
    'PyTorch',
    'JavaScript / TypeScript / Next.js',
    'SQL',
    'QGIS',
    'ArcGIS',
    'GeoPandas',
    'Pandas',
    'Tableau',
    'Power BI',
    'Git',
  ];

  return (
    <section ref={sectionRef} id="skills" className="min-h-screen py-20 relative" style={{
      background: themeColors.background.sections?.skills || themeColors.background.gradient,
      transition: 'background 0.3s ease-in-out'
    }}>
      {/* Gradient overlay for smooth transition from previous section */}
      <div 
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '300px', background: 'transparent', zIndex: 1 }}
      />
      <div className="container mx-auto px-6 relative" style={{ zIndex: 2 }}>
        <h2 className="text-4xl font-bold text-center mb-12" style={{ color: isDarkMode ? themeColors.colors.white : themeColors.colors.pink[500] }}>Skills</h2>
        <p
          style={{
            maxWidth: '920px',
            margin: '0 auto 1.75rem',
            textAlign: 'center',
            color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
            lineHeight: 1.8,
            fontSize: '1rem',
          }}
        >
          {skills.join(' · ')}
        </p>
      </div>
    </section>
  );
};

export default Skills;