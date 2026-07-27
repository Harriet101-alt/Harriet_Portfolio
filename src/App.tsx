import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DarkModeProvider } from './contexts/DarkModeContext'
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
      <Suspense fallback={<div className="h-64 flex items-center justify-center" />}>
      </Suspense>
    </>
  )
}

function AppContent() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const depth = total > 0 ? window.scrollY / total : 0;
      let opacity: number;
      if (depth <= 0.5) {
        opacity = 0.58 + (depth / 0.5) * (0.66 - 0.58);
      } else {
        opacity = 0.66 + ((depth - 0.5) / 0.5) * (0.74 - 0.66);
      }
      if (overlayRef.current) {
        overlayRef.current.style.setProperty('--reading-overlay-opacity', opacity.toFixed(3));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative">
      {/* Layer 0–9: gamified forest world — never captures pointer events */}
      <ForestBackground />

      <div className="theme-sunset-layer" aria-hidden="true">
        <div className="theme-sun-disc" />
        <div className="theme-horizon" />
      </div>

      {/* Reading overlay — parchment wash for black text legibility */}
      <div
        ref={overlayRef}
        className="reading-overlay"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
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