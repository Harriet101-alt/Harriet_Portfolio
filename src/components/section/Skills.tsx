import { useRef } from "react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useThemeColors } from "../../hooks/useThemeColors";

const Skills = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const skillGroups = [
    {
      title: 'Languages & Development',
      skills: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'React', 'Next.js', 'Vite'],
    },
    {
      title: 'Data Science & Machine Learning',
      skills: ['PyTorch', 'scikit-learn', 'Pandas', 'Optuna', 'Random Forest', 'XGBoost'],
    },
    {
      title: 'Geospatial & Environmental Data',
      skills: ['QGIS', 'ArcGIS', 'GeoPandas', 'Raster workflows', 'Census API', 'Remote sensing datasets'],
    },
    {
      title: 'Analytics & Delivery',
      skills: ['Tableau', 'Power BI', 'Git', 'Streamlit', 'Technical communication', 'Stakeholder dashboards'],
    },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {skillGroups.map((group) => (
            <article
              key={group.title}
              className="card-geo-layer rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: isDarkMode ? themeColors.colors.dark[800] : themeColors.colors.white,
                border: `1px solid ${isDarkMode ? themeColors.colors.pink[800] : themeColors.colors.pink[200]}`,
                boxShadow: `0 12px 30px ${isDarkMode ? 'rgba(0,0,0,0.24)' : 'rgba(139,90,101,0.12)'}`,
              }}
            >
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[700] }}
              >
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm rounded-full px-3 py-2"
                    style={{
                      background: isDarkMode ? themeColors.colors.dark[700] : themeColors.colors.pink[50],
                      color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
                      border: `1px solid ${isDarkMode ? themeColors.colors.pink[700] : themeColors.colors.pink[200]}`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;