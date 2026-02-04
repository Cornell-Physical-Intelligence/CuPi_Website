import { useCallback, useEffect, useMemo, useState } from 'react';
import GlassSurface from './components/GlassSurface';
import GridBackground from './components/GridBackground';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import AboutPage from './pages/AboutPage';
import ApplyPage from './pages/ApplyPage';
import './App.css';
import { assetPath } from './utils/assetPath';
import { preloadImages } from './utils/preloadImages';
import { getAboutImagePaths } from './data/team';

const VALID_PAGES = ['home', 'work', 'about', 'apply'];

const getPageFromHash = () => {
  const hash = window.location.hash.replace('#', '');
  return VALID_PAGES.includes(hash) ? hash : 'home';
};

const glassSettings = {
  borderRadius: 14,
  blur: 2,
  displace: 2,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20,
  brightness: 50,
  opacity: 0.8,
  backgroundOpacity: 0,
  saturation: 1
};

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleNavClick = (page) => {
    window.location.hash = page === 'home' ? '' : page;
    setCurrentPage(page);
  };

  useEffect(() => {
    // Force scroll to top on load/reload (override browser scroll restoration)
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const onHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('scrolled');
  }, [currentPage]);

  const projectImagePaths = useMemo(
    () => [
      assetPath('img/Quad.png'),
      assetPath('img/DroneFlipped.png'),
      assetPath('img/Hexapod.png'),
      assetPath('img/LegFlipped.png'),
      assetPath('img/SwallowProject.png'),
    ],
    []
  );

  const aboutPreviewPaths = useMemo(() => getAboutImagePaths().slice(0, 6), []);

  const prefetchPageAssets = useCallback((page) => {
    if (page === 'work') {
      preloadImages(projectImagePaths, { priority: 'low' });
    }
    if (page === 'about' && aboutPreviewPaths.length) {
      preloadImages(aboutPreviewPaths, { priority: 'low' });
    }
  }, [projectImagePaths, aboutPreviewPaths]);

  const handleLightboxChange = useCallback((isOpen) => {
    setLightboxOpen(isOpen);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onLightboxChange={handleLightboxChange} />;
      case 'work':
        return <WorkPage />;
      case 'about':
        return <AboutPage />;
      case 'apply':
        return <ApplyPage />;
      default:
        return null;
    }
  };

  return (
    <div className={`demo-container ${lightboxOpen ? 'lightbox-open' : ''}`}>
      {currentPage === 'home' && <GridBackground />}
      <nav className="menu-bar">
        <GlassSurface
          width="auto"
          height={44}
          {...glassSettings}
        >
          <div className="menu-content">
            <button
              onClick={() => handleNavClick('home')}
              className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavClick('work')}
              onMouseEnter={() => prefetchPageAssets('work')}
              onFocus={() => prefetchPageAssets('work')}
              className={`menu-item ${currentPage === 'work' ? 'active' : ''}`}
            >
              WORK
            </button>
            <button
              onClick={() => handleNavClick('about')}
              onMouseEnter={() => prefetchPageAssets('about')}
              onFocus={() => prefetchPageAssets('about')}
              className={`menu-item ${currentPage === 'about' ? 'active' : ''}`}
            >
              ABOUT
            </button>
            <button
              onClick={() => handleNavClick('apply')}
              className={`menu-item ${currentPage === 'apply' ? 'active' : ''}`}
              type="button"
            >
              APPLY
            </button>
          </div>
        </GlassSurface>
      </nav>

      {renderPage()}
    </div>
  );
}

export default App;
