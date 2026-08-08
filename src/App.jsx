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
// Real paths rather than #fragments. The build writes an index.html into a folder per
// route, so /work is a genuine document that Pages can serve and the router reads back
// from the pathname.
const getPageFromPath = () => {
  const seg = window.location.pathname.replace(/^\/+|\/+$/g, '');
  return VALID_PAGES.includes(seg) ? seg : 'home';
};

// Navigating lives at module scope (components must not assign to globals directly).
const writePath = (page) => {
  window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
};

// Anything still linking to the old #work style URLs is rewritten in place, once, before
// the first render, so those links keep working and no stray fragment is left in the bar.
const legacyHash = window.location.hash.replace('#', '');
if (VALID_PAGES.includes(legacyHash)) {
  window.history.replaceState({}, '', legacyHash === 'home' ? '/' : `/${legacyHash}`);
} else if (window.location.hash) {
  window.history.replaceState({}, '', window.location.pathname);
}

// The live-tuning panel is a dev-only tool — Vite sets this false in production builds,
// so the "Customize" button and panel never ship to visitors.
const SHOW_CUSTOMIZE = import.meta.env.DEV;

export default function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromPath);
  const [inverted, setInverted] = useState(P.invert);
  const [showControls, setShowControls] = useState(false);
  const titleApi = useRef(null);

  // Keep the page chrome (background + text colours) in sync with the canvas theme.
  useEffect(() => {
    document.body.dataset.theme = inverted ? 'light' : 'dark';
  }, [inverted]);

  // Follow the browser's back and forward buttons.
  useEffect(() => {
    const onPop = () => setCurrentPage(getPageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPage]);

  const navigate = (page) => {
    writePath(page);
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
