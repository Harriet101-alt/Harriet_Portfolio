import { Link } from 'react-router-dom';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function NotFound() {
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  return (
    <section
      className="min-h-screen flex items-center justify-center px-6 text-center"
      style={{ background: themeColors.background.gradient }}
    >
      <div
        className="max-w-xl rounded-3xl p-8"
        style={{
          background: isDarkMode ? themeColors.colors.dark[800] : themeColors.colors.white,
          border: `1px solid ${isDarkMode ? themeColors.colors.pink[800] : themeColors.colors.pink[200]}`,
          color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
        }}
      >
        <p className="text-sm uppercase tracking-[0.3em] mb-3" style={{ color: themeColors.colors.pink[500] }}>
          404
        </p>
        <h1 className="text-3xl font-bold mb-4">Trail not found</h1>
        <p className="mb-6 leading-relaxed">
          This route does not exist, but the main portfolio path is still just one step away.
        </p>
        <Link className="project-btn inline-flex items-center justify-center" style={{ textDecoration: 'none' }} to="/">
          Back to portfolio
        </Link>
      </div>
    </section>
  );
}
