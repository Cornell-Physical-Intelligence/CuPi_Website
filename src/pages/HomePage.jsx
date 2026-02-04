import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';
import MissionTiles from '../components/MissionTiles';
import SiteFooter from '../components/SiteFooter';
import { assetPath } from '../utils/assetPath';
import { preloadImages } from '../utils/preloadImages';
import { GALLERY_IMAGES, GALLERY_THUMB_WIDTHS, getGalleryThumbPath } from '../data/gallery';
import { SUBTEAMS } from '../data/subteams';

const ASCIIText = lazy(() => import('../components/ASCIIText'));

const HERO_FONT_FAMILY = "'Times New Roman', Times, serif";

function HomePage({ onLightboxChange }) {
  const [showAsciiText, setShowAsciiText] = useState(false);
  const [isCompactHero, setIsCompactHero] = useState(false);
  const [missionTilesPlayed, setMissionTilesPlayed] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedTeams, setExpandedTeams] = useState(new Set());

  const toggleTeam = useCallback((title) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);
  const debugCollapseTriggeredRef = useRef(false);
  const scrollLockActiveRef = useRef(false);
  const debugHideTimeoutRef = useRef(null);
  const scrollUnlockTimeoutRef = useRef(null);
  const subteamPanelRef = useRef(null);

  const heroAsciiConfig = isCompactHero
    ? { asciiFontSize: 7.8, textFontSize: 736, planeBaseHeight: 24, scaleMultiplier: 1.05, verticalOffset: 0.02 }
    : { asciiFontSize: 10.8, textFontSize: 384, planeBaseHeight: 12, scaleMultiplier: 1, verticalOffset: 0 };
  const heroAsciiFps = isCompactHero ? 18 : 24;
  const heroAsciiText = isCompactHero ? 'C\nU\nP\nI' : 'CUPI';
  const heroAsciiLineSpacing = isCompactHero ? 1.08 : 1;
  const heroSubtitleText = '(Cornell University Physical Intelligence)';

  // Notify parent about lightbox state for container class
  useEffect(() => {
    onLightboxChange?.(!!expandedImage);
  }, [expandedImage, onLightboxChange]);

  // Escape key to close lightbox
  useEffect(() => {
    if (!expandedImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setExpandedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedImage]);

  // Finalize subteams panel on scroll (dotted → solid, tag flash out)
  useEffect(() => {
    const el = subteamPanelRef.current;
    if (!el) return;
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            el.classList.add('is-finalized');
          }, 800);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  // Display state (reduced motion, compact hero)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const motionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    const updateDisplayState = () => {
      const prefersReducedMotion = motionQuery?.matches ?? false;
      setShowAsciiText(!prefersReducedMotion);
      setIsCompactHero(window.innerWidth < 640);
    };

    updateDisplayState();
    motionQuery?.addEventListener('change', updateDisplayState);
    window.addEventListener('resize', updateDisplayState);

    return () => {
      motionQuery?.removeEventListener('change', updateDisplayState);
      window.removeEventListener('resize', updateDisplayState);
    };
  }, []);

  // Slow scroll effect
  useEffect(() => {
    const MOBILE_BREAKPOINT = 640;
    const DEBUG_HIDE_DELAY = 500;
    const SLOW_SCROLL_DURATION = DEBUG_HIDE_DELAY + 150;
    const EASE_OUT_DURATION = 400;
    const INITIAL_DAMPING = 0.12;
    const scrollKeys = new Set(['Space', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End', ' ']);
    let lastTouchY = 0;
    let slowScrollStartTime = 0;

    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const getCurrentDamping = () => {
      if (!slowScrollStartTime) return 1;
      const elapsed = Date.now() - slowScrollStartTime;
      if (elapsed < SLOW_SCROLL_DURATION) return INITIAL_DAMPING;
      const easeElapsed = elapsed - SLOW_SCROLL_DURATION;
      if (easeElapsed >= EASE_OUT_DURATION) return 1;
      const progress = easeElapsed / EASE_OUT_DURATION;
      return INITIAL_DAMPING + (1 - INITIAL_DAMPING) * easeOutCubic(progress);
    };

    const enableSlowScroll = () => {
      if (scrollLockActiveRef.current) return;
      scrollLockActiveRef.current = true;
      slowScrollStartTime = Date.now();
      document.body.classList.add('slow-scroll-active');
    };

    const disableSlowScroll = () => {
      scrollLockActiveRef.current = false;
      slowScrollStartTime = 0;
      document.body.classList.remove('slow-scroll-active');
      if (window.scrollY === 0) {
        document.body.classList.remove('scrolled');
      }
    };

    const triggerDebugCollapse = () => {
      if (debugCollapseTriggeredRef.current) return;
      debugCollapseTriggeredRef.current = true;

      if (!isMobile()) {
        enableSlowScroll();
      }

      document.body.classList.add('scrolled-once');

      debugHideTimeoutRef.current = window.setTimeout(() => {
        document.body.classList.add('debug-hidden');
      }, DEBUG_HIDE_DELAY);

      if (!isMobile()) {
        scrollUnlockTimeoutRef.current = window.setTimeout(() => {
          disableSlowScroll();
        }, SLOW_SCROLL_DURATION + EASE_OUT_DURATION);
      }
    };

    const handleWheel = (event) => {
      if (isMobile()) return;
      if (!debugCollapseTriggeredRef.current) {
        event.preventDefault();
        triggerDebugCollapse();
        const dampedDelta = event.deltaY * getCurrentDamping();
        window.scrollBy({ top: dampedDelta, behavior: 'auto' });
      } else if (scrollLockActiveRef.current) {
        event.preventDefault();
        const dampedDelta = event.deltaY * getCurrentDamping();
        window.scrollBy({ top: dampedDelta, behavior: 'auto' });
      }
    };

    const handleTouchStart = (event) => {
      if (isMobile()) return;
      if (event.touches.length > 0) {
        lastTouchY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
      if (isMobile()) return;
      if (event.touches.length === 0) return;
      const currentY = event.touches[0].clientY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;
      if (!debugCollapseTriggeredRef.current) {
        event.preventDefault();
        triggerDebugCollapse();
        const dampedDelta = deltaY * getCurrentDamping();
        window.scrollBy({ top: dampedDelta, behavior: 'auto' });
      } else if (scrollLockActiveRef.current) {
        event.preventDefault();
        const dampedDelta = deltaY * getCurrentDamping();
        window.scrollBy({ top: dampedDelta, behavior: 'auto' });
      }
    };

    const handleKeyDown = (event) => {
      if (isMobile()) return;
      const pressedKey = event.code || event.key;
      if (pressedKey && scrollKeys.has(pressedKey)) {
        if (!debugCollapseTriggeredRef.current) {
          event.preventDefault();
          triggerDebugCollapse();
        } else if (scrollLockActiveRef.current) {
          event.preventDefault();
          const keyScrollAmount = 20 * getCurrentDamping();
          const direction = ['ArrowUp', 'PageUp', 'Home'].includes(pressedKey) ? -1 : 1;
          window.scrollBy({ top: keyScrollAmount * direction, behavior: 'auto' });
        }
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 0) {
        document.body.classList.add('scrolled');
        if (!debugCollapseTriggeredRef.current) {
          triggerDebugCollapse();
        }
      } else if (!scrollLockActiveRef.current) {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (debugHideTimeoutRef.current) clearTimeout(debugHideTimeoutRef.current);
      if (scrollUnlockTimeoutRef.current) clearTimeout(scrollUnlockTimeoutRef.current);
      document.body.classList.remove('slow-scroll-active');
      // Reset so the effect replays on next mount
      debugCollapseTriggeredRef.current = false;
    };
  }, []);

  const renderAsciiContent = () => (
    <>
      {showAsciiText && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <ASCIIText
              text={heroAsciiText}
              asciiFontSize={heroAsciiConfig.asciiFontSize}
              textFontSize={heroAsciiConfig.textFontSize}
              planeBaseHeight={heroAsciiConfig.planeBaseHeight}
              enableWaves={false}
              textFontFamily={HERO_FONT_FAMILY}
              lineSpacing={heroAsciiLineSpacing}
              scaleMultiplier={heroAsciiConfig.scaleMultiplier}
              verticalOffset={heroAsciiConfig.verticalOffset}
              targetFps={heroAsciiFps}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      <h1 className="main-title no-glass" style={{ fontFamily: HERO_FONT_FAMILY }}>
        CUPI
      </h1>
    </>
  );

  const renderHeroSection = () => {
    if (isCompactHero) {
      return (
        <section className="mobile-hero">
          <div className="mobile-hero__visual">{renderAsciiContent()}</div>
          <p className="mobile-hero__subtitle main-subtitle" style={{ fontFamily: HERO_FONT_FAMILY }}>
            {heroSubtitleText}
          </p>
        </section>
      );
    }

    return (
      <div className="title-wrapper">
        <div className="ascii-logo">
          <div className="ascii-logo__visual">{renderAsciiContent()}</div>
          <p className="main-subtitle" style={{ fontFamily: HERO_FONT_FAMILY }}>
            {heroSubtitleText}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`content-section ${isCompactHero ? 'content-section--mobile-hero' : ''}`}>
        {renderHeroSection()}
        <div className="spacer" />
      </div>
      <MissionTiles played={missionTilesPlayed} onPlay={() => setMissionTilesPlayed(true)} />
      <section className="subteam-section">
        <article className="subteam-panel subteam-panel--stacked" ref={subteamPanelRef}>
          <div className="subteam-panel__inner">
            {SUBTEAMS.map((team) => {
              const isExpanded = expandedTeams.has(team.title);
              return (
                <div className="subteam-panel__blurb" key={team.title}>
                  <div
                    className="subteam-panel__header"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleTeam(team.title)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleTeam(team.title);
                      }
                    }}
                  >
                    <h3 className="subteam-panel__title">{team.title}</h3>
                    <span className={`subteam-panel__toggle ${isExpanded ? 'is-expanded' : ''}`}>
                      {isExpanded ? '[\u2212]' : '[+]'}
                    </span>
                  </div>
                  <p className="subteam-panel__desc">{team.description}</p>
                  <div className={`subteam-panel__items-wrap ${isExpanded ? 'is-expanded' : ''}`}>
                    <div>
                      {team.items && team.items.length > 0 && (
                        <div className="subteam-panel__items">
                          <p className="subteam-panel__items-label">{team.label}</p>
                          <ul className="subteam-panel__items-list">
                            {team.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
      <section className="gallery-section">
        <h2 className="section-label">Gallery</h2>
        <div className="gallery-tapestry">
          {GALLERY_IMAGES.map((image, index) => {
            const aspectRatio = image.width && image.height ? `${image.width}/${image.height}` : undefined;
            const fullSrc = assetPath(`img/Gallery/${image.filename}`);
            const thumbSrc = getGalleryThumbPath(image.filename, GALLERY_THUMB_WIDTHS[0]);
            const thumbSrcSet = `${getGalleryThumbPath(image.filename, GALLERY_THUMB_WIDTHS[0])} ${GALLERY_THUMB_WIDTHS[0]}w, ${getGalleryThumbPath(image.filename, GALLERY_THUMB_WIDTHS[1])} ${GALLERY_THUMB_WIDTHS[1]}w`;

            return (
              <div
                className="gallery-item"
                key={image.filename}
                onClick={() => setExpandedImage(image)}
                role="button"
                tabIndex={0}
                style={aspectRatio ? { aspectRatio } : undefined}
                onMouseEnter={() => preloadImages([fullSrc], { priority: 'low' })}
                onFocus={() => preloadImages([fullSrc], { priority: 'low' })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedImage(image);
                  }
                }}
              >
                <img
                  src={thumbSrc}
                  srcSet={thumbSrcSet}
                  sizes="(min-width: 1600px) 25vw, (min-width: 900px) 33vw, (min-width: 480px) 50vw, 100vw"
                  alt={`Concept art ${index + 1}`}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index < 3 ? 'high' : 'auto'}
                  width={image.width}
                  height={image.height}
                  onLoad={(e) => {
                    e.currentTarget.classList.add('loaded');
                    e.currentTarget.parentElement?.classList.add('is-loaded');
                  }}
                  onError={(e) => {
                    e.currentTarget.classList.add('loaded');
                    e.currentTarget.parentElement?.classList.add('is-loaded');
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="gallery-fade-end" />
        <p className="gallery-more">(more to come)</p>
      </section>
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            className="gallery-lightbox"
            role="dialog"
            aria-label="Expanded image view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpandedImage(null)}
          >
            <button
              className="gallery-lightbox__close"
              onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
              aria-label="Close lightbox"
            >
              &times;
            </button>
            <motion.div
              className="gallery-lightbox__content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={assetPath(`img/Gallery/${expandedImage.filename}`)}
                alt="Expanded view"
              />
              <span className="gallery-lightbox__author">by {expandedImage.author}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SiteFooter />
    </>
  );
}

export default HomePage;
