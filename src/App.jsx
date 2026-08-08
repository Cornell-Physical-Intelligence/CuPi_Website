import { useState, useRef, useEffect } from 'react';
import Controls from './components/Controls';
import Home from './pages/Home';
import Work from './pages/Work';
import Members from './pages/Members';
import Sponsors from './pages/Sponsors';
import Apply from './pages/Apply';
import { P, applyParam } from './components/voronoiConfig';
import './App.css';

// Hash-based routing, mirroring the old General-Website (no router dependency).
const NAV_ITEMS = [
  { label: 'Home', page: 'home' },
  { label: 'Work', page: 'work' },
  { label: 'Members', page: 'members' },
  { label: 'Sponsors', page: 'sponsors' },
  { label: 'Apply', page: 'apply' },
];
const VALID_PAGES = ['home', 'work', 'members', 'sponsors', 'apply'];
const getPageFromHash = () => {
  const hash = window.location.hash.replace('#', '');
  return VALID_PAGES.includes(hash) ? hash : 'home';
};
// Writing the hash lives at module scope (components must not assign to globals directly).
const writeHash = (page) => {
  window.location.hash = page === 'home' ? '' : page;
};

// The live-tuning panel is a dev-only tool — Vite sets this false in production builds,
// so the "Customize" button and panel never ship to visitors.
const SHOW_CUSTOMIZE = import.meta.env.DEV;

export default function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [inverted, setInverted] = useState(P.invert);
  const [showControls, setShowControls] = useState(false);
  const titleApi = useRef(null);

  // Keep the page chrome (background + text colours) in sync with the canvas theme.
  useEffect(() => {
    document.body.dataset.theme = inverted ? 'light' : 'dark';
  }, [inverted]);

  // Sync the page with the URL hash (and the browser back/forward buttons).
  useEffect(() => {
    const onHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPage]);

  const navigate = (page) => {
    writeHash(page);
    setCurrentPage(page);
  };

  const handleInvert = (value) => {
    applyParam('invert', value);
    setInverted(value);
    titleApi.current?.poke();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'work':
        return <Work />;
      case 'members':
        return <Members />;
      case 'sponsors':
        return <Sponsors />;
      case 'apply':
        return <Apply />;
      default:
        return <Home titleApi={titleApi} />;
    }
  };

  const onHome = currentPage === 'home';

  return (
    <div className={`app ${inverted ? 'app--light' : 'app--dark'}`}>
      <nav className="menu-bar">
        <div className="menu-glass">
          <div className="menu-content">
            {NAV_ITEMS.map(({ label, page }) => (
              <button
                key={page}
                type="button"
                className={`menu-item ${currentPage === page ? 'active' : ''}`}
                onClick={() => navigate(page)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {SHOW_CUSTOMIZE && onHome && (
        <button
          type="button"
          className="controls-toggle"
          onClick={() => setShowControls((s) => !s)}
          aria-pressed={showControls}
        >
          {showControls ? '× Close' : '⚙ Customize'}
        </button>
      )}

      {SHOW_CUSTOMIZE && onHome && showControls && (
        <Controls apiRef={titleApi} inverted={inverted} onInvertChange={handleInvert} />
      )}

      {/* Everything the glass refracts lives inside #page-content. */}
      <main id="page-content">{renderPage()}</main>
    </div>
  );
}
