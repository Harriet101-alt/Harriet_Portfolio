import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext'
import Navigation from './components/section/Navigation'
import About from './components/section/About'
import ForestBackground from './components/ui/ForestBackground'
import './App.css'

const Contact        = lazy(() => import('./pages/Contact'))
const Projects       = lazy(() => import('./components/section/Projects'))
const Experience     = lazy(() => import('./components/section/ExperienceSection'))
const Skills         = lazy(() => import('./components/section/Skills'))
const Footer         = lazy(() => import('./components/Footer'))

function HomePage() {
  return (
    <>
      <About />
      <Suspense fallback={<div className="h-screen flex items-center justify-center" />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<div className="h-64 flex items-center justify-center" />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<div className="h-screen flex items-center justify-center" />}>
        <Skills />
      </Suspense>
    </>
  )
}

function AppContent() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const depth = total > 0 ? window.scrollY / total : 0;
      // Lighter overlay — forest shows through more vividly
      let opacity: number;
      if (depth <= 0.5) {
        opacity = 0.18 + (depth / 0.5) * (0.28 - 0.18);
      } else {
        opacity = 0.28 + ((depth - 0.5) / 0.5) * (0.38 - 0.28);
      }
      if (overlayRef.current) {
        if (isDarkMode) {
          // Dark overlay: lets the dark forest show through while keeping text legible
          overlayRef.current.style.background = `rgba(0, 0, 0, ${(opacity * 0.55).toFixed(3)})`;
        } else {
          overlayRef.current.style.background = `rgba(255, 255, 255, ${opacity.toFixed(3)})`;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isDarkMode]);

  return (
    <div className="relative">
      {/* Layer 0–9: SVG illustrated forest — never captures pointer events */}
      <ForestBackground />

      {/* Reading overlay — switches between warm-white (light) and dark (dark mode) */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          background: isDarkMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.18)',
          pointerEvents: 'none',
        }}
      />

      {/* Navigation — z-index 99999 in its own styles */}
      <Navigation />

      {/* Content — z-index 20+ above the overlay */}
      <div
        className="app"
        style={{ position: 'relative', zIndex: 20, background: 'transparent' }}
      >
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <main id="main-content" className="main-content">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen" />}>
            <Routes>
              <Route path="/"        element={<HomePage />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
        <Suspense fallback={<div className="h-32 flex items-center justify-center" />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  )
}

export default App