import { useState, useRef, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import Controls from './components/Controls';
import { P, applyParam } from './components/voronoiConfig';
import { getPageFromPath, writePath } from './routes';
import { applyPageSeo } from './seo';
import './App.css';

// The four pages that are not the landing page are split out. One bundle meant a visitor
// opening /apply — a page that is a picture of a crab and two sentences — downloaded and
// parsed the Voronoi hero, the gallery, the roster, the sponsor wall and the report viewer
// first. The build also writes a modulepreload for the right chunk into each route's HTML
// (see vite.config.js), so a deep link fetches its page in parallel with the entry rather
// than after it.
//
// Home stays in the entry chunk deliberately. Splitting it too was measured and reverted:
// it is where most visits start, and behind Suspense the hero cannot draw until a second
// module has been fetched *and* evaluated — the preload removes the extra request but not
// the extra step, which showed up as a slower largest paint on the one page that can least
// afford it. The rest of the site is a few kilobytes lighter for carrying it.
import Home from './pages/Home';

const Work = lazy(() => import('./pages/Work'));
const Members = lazy(() => import('./pages/Members'));
const Sponsors = lazy(() => import('./pages/Sponsors'));
const Apply = lazy(() => import('./pages/Apply'));
const Vq1Report = lazy(() => import('./pages/Vq1Report'));
const RacingReport = lazy(() => import('./pages/RacingReport'));

const PREFETCH = {
  work: () => import('./pages/Work'),
  members: () => import('./pages/Members'),
  sponsors: () => import('./pages/Sponsors'),
  apply: () => import('./pages/Apply'),
  vq1Report: () => import('./pages/Vq1Report'),
  racingReport: () => import('./pages/RacingReport'),
};

const NAV_ITEMS = [
  { label: 'Home', page: 'home' },
  { label: 'Work', page: 'work' },
  { label: 'Members', page: 'members' },
  { label: 'Sponsors', page: 'sponsors' },
  { label: 'Apply', page: 'apply' },
];
// The live-tuning panel is a dev-only tool — Vite sets this false in production builds,
// so the "Customize" button and panel never ship to visitors.
const SHOW_CUSTOMIZE = import.meta.env.DEV;

export default function App({ initialPage, InitialPage, onFirstCommit }) {
  const [currentPage, setCurrentPage] = useState(initialPage ?? getPageFromPath);
  const [inverted, setInverted] = useState(P.invert);
  const [showControls, setShowControls] = useState(false);
  const titleApi = useRef(null);

  // The static SEO document is suppressed before first paint on JavaScript-capable
  // loads. This runs after React has committed the real page but before the browser
  // paints that commit, so the alternate fallback design never appears between the
  // blank canvas and the app.
  useLayoutEffect(() => {
    onFirstCommit?.();
  }, [onFirstCommit]);

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

  useEffect(() => {
    applyPageSeo(currentPage);
  }, [currentPage]);

  // Warm the other routes so navigation is instant. The whole set is a few tens of
  // kilobytes, so by the time anyone clicks, the chunk is in cache and the split costs
  // nothing a visitor can feel.
  //
  // It waits for `load` before even asking to be scheduled. An idle callback alone is not
  // late enough: `requestIdleCallback` fires in the gaps *during* loading too, and a
  // dynamic import is a full-priority fetch, so prefetching from the first gap put five
  // route chunks in front of the image the page was still trying to paint. Measured, that
  // cost 200ms of LCP on the roster — a page got slower because of work done to make the
  // next one faster.
  useEffect(() => {
    let idleId;
    let timeoutId;

    const warm = () => Object.values(PREFETCH).forEach((load) => load());
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(warm, { timeout: 3000 });
      } else {
        timeoutId = window.setTimeout(warm, 300);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const navigate = (page) => {
    writePath(page);
    setCurrentPage(page);
  };

  // Only the hero and the sponsor lockups draw Playfair, so only those two documents
  // preload it (see vite.config.js). Warming it on the way in — on the idle pass, say —
  // would put the 23KB straight back on the pages that had just been spared it. Pointing
  // at the link is the first moment the fetch is worth anything, and it still lands well
  // before the click does.
  const warmPlayfairFor = (page) => {
    if (page !== 'home' && page !== 'sponsors') return;
    if (document.querySelector('link[href*="playfair-display"]')) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = '/fonts/playfair-display-700-latin.woff2';
    document.head.appendChild(link);
  };

  const handleInvert = (value) => {
    applyParam('invert', value);
    setInverted(value);
    titleApi.current?.poke();
  };

  const renderPage = () => {
    // The landing route was resolved in main.jsx, so on the first paint it is a plain
    // component and nothing suspends. Every later navigation goes through lazy(), by which
    // point the prefetch has already put the chunk in cache.
    if (currentPage === initialPage && InitialPage) return <InitialPage />;

    switch (currentPage) {
      case 'work':
        return <Work />;
      case 'members':
        return <Members />;
      case 'sponsors':
        return <Sponsors />;
      case 'apply':
        return <Apply />;
      case 'vq1Report':
        return <Vq1Report />;
      case 'racingReport':
        return <RacingReport />;
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
                onMouseEnter={() => warmPlayfairFor(page)}
                onFocus={() => warmPlayfairFor(page)}
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

      {/* Everything the glass refracts lives inside #page-content. The fallback is null
          rather than a spinner: the split routes are prefetched during idle, so this
          resolves in the same frame in every case except a cold click on a slow link, and
          a flash of loading text would be the more noticeable of the two. */}
      <div id="page-content">
        <Suspense fallback={null}>{renderPage()}</Suspense>
      </div>
    </div>
  );
}
