import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassSurface from './components/GlassSurface';
import GridBackground from './components/GridBackground';
import MissionTiles from './components/MissionTiles';
import SiteFooter from './components/SiteFooter';
import './App.css';
import { assetPath } from './utils/assetPath';
import { preloadImages } from './utils/preloadImages';

const ASCIIText = lazy(() => import('./components/ASCIIText'));

const APPLY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSePAs7xr7J6OrCI2z-gBEo6HAQ4Aip6ps0nbR93yQYDhYqlbQ/viewform';

const GALLERY_IMAGES = [
  { filename: 'PixelHands.png', author: 'Sophie', width: 750, height: 1128 },
  { filename: 'HexapodLeg.jpeg', author: 'Hamilton', width: 4783, height: 2782 },
  { filename: 'DragonFlyTop.png', author: 'Sophie', width: 850, height: 1000 },
  { filename: 'PosterSlide.png', author: 'Hamilton', width: 1346, height: 1440 },
  { filename: 'GlitchDrone.png', author: 'Andre', width: 1024, height: 1024 },
  { filename: 'PosterSketch.png', author: 'Hamilton', width: 1792, height: 2400 },
  { filename: 'VTOL.png', author: 'Andre', width: 2644, height: 1314 },
  { filename: 'HandsSketch.png', author: 'Sophie', width: 1000, height: 1600 },
  { filename: 'MetalPoster.png', author: 'Sophie', width: 1792, height: 2215 },
  { filename: 'Separated.png', author: 'Hamilton', width: 848, height: 721 },
  { filename: 'PosterRed.png', author: 'Hamilton', width: 880, height: 1168 },
  { filename: 'Spider.png', author: 'Sophie', width: 1100, height: 1100 }
];

const HERO_FONT_FAMILY = "'Times New Roman', Times, serif";
const BIO_PLACEHOLDER = '[coming soon]';

const TEAM_SECTIONS = [
  {
    title: 'Team Lead',
    members: [
      {
        name: 'Andre Boufama',
        imageBase: 'Andre',
        bio: "Hi I'm Andre. I like making websites and CAD and also eating",
        role: 'Team Lead',
        project: 'Quad'
      }
    ]
  },
  {
    title: 'Leads',
    members: [
      {
        name: 'Jonathan Song',
        imageBase: 'Jon',
        bio: "I'm really passionate about integrated electronics and anything robotics. In my free time I like to play ultimate frisbee and acoustic guitar",
        role: 'Electrical Co-Lead',
        project: 'Hexapod'
      },
      {
        name: 'Mic Robbins',
        imageBase: 'Mic',
        bio: "I'm a sophomore electrical engineer and like to play clash royale (15k)",
        role: 'Electrical Co-Lead',
        project: 'Quad'
      },
      {
        name: 'Alan Munschy',
        imageBase: 'Alan',
        bio: 'Hi, I like working on robot controls and I play chess',
        role: 'Mech Co-Lead',
        project: 'Hexapod'
      },
      {
        name: 'Ollie Aizer',
        imageBase: 'Ollie',
        bio: 'Hi, my name is Ollie and I like drone design and cooking.',
        role: 'Mech Co-Lead',
        project: 'Quad'
      },
      {
        name: 'James Cenawood',
        bio: BIO_PLACEHOLDER,
        role: 'Computer Science Lead',
        project: 'Quad'
      },
      {
        name: 'Max Lee',
        bio: BIO_PLACEHOLDER,
        role: 'Operations Lead',
        project: 'Quad'
      }
    ]
  },
  {
    title: 'Members',
    members: [
      {
        name: 'Daniel Sheth',
        imageBase: 'Daniel',
        bio: 'I am an aspiring mechanical engineer interested in aerodynamics and propulsion systems',
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Josh Lennon',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Sophie Di',
        bio: "I'm a mechanical engineer and I love sketching, bouldering, and throwing paper airplanes",
        year: 'Freshman',
        project: 'Quad'
      },
      {
        name: 'Nicholas Letendre',
        imageBase: 'NickLet',
        bio: "I'm Nicholas, and I am a sophomore studying mechanical and aerospace engineering. I'm interested in programming for robotics and games.",
        year: 'Sophomore',
        project: 'Hexapod'
      },
      {
        name: 'Lindsay Kossoff',
        imageBase: 'Lindsay',
        bio: 'Hi, my name is Lindsay Kossoff. I am a freshman from Maryland studying mechanical engineering.',
        year: 'Freshman',
        project: 'Quad'
      },
      {
        name: 'Christopher Guillen-Chacon',
        imageBase: 'Chris',
        bio: "My name is Chris and I'm interested in drone design",
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Nick Lennon',
        imageBase: 'NickLen',
        bio: 'Hey, my name is Nick Lennon and I am interested in software, firmware, modeling, team coordination, and spicy food!',
        year: 'Junior',
        project: 'Quad'
      },
      {
        name: 'Ronan Alo',
        imageBase: 'Ronan',
        bio: 'I am a sophomore majoring in mechanical engineering and computer science, interested in drone pathing',
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Hamilton Jeong',
        imageBase: 'Hamilton',
        bio: "I'm a BioStats major, I like competing in Taekwondo and playing piano",
        year: 'Junior',
        project: 'Quad'
      },
      {
        name: 'Anthony Parlatore',
        imageBase: 'Anthony',
        bio: "I'm Anthony, senior ChemE in masters of MechE interested in new technology (and I really like drones)",
        year: 'Senior',
        project: 'Quad'
      }
    ]
  }
];

const PROFESSORS = [
  {
    name: 'Prof. Jake Welde',
    imageBase: 'ProfWelde',
    formalSuffix: '_suit',
    bio: 'He has worked extensively in drone control systems',
    role: 'Faculty'
  },
  {
    name: 'Prof. Jingjie Yeo',
    imageBase: 'ProfYeo',
    formalSuffix: '_Suit',
    bio: 'Joined Cornell in 2020 after research in Singapore and postdocs at Tufts & MIT.',
    role: 'Faculty'
  }
];

const CRAB_FRAMES = [
  'icons/logo-1.svg',
  'icons/logo-2.svg',
  'icons/logo-3.svg',
];

const CRAB_WIGGLE = [0, 4, -4, 3, -3, 0];

function CrabAnimation() {
  const [frame, setFrame] = useState(0);
  const [rotation, setRotation] = useState(0);
  const playingRef = useRef(false);

  const playAnimation = () => {
    if (playingRef.current) return;
    playingRef.current = true;
    const sequence = [1, 2, 1, 0];
    let i = 0;
    const id = setInterval(() => {
      setFrame(sequence[i]);
      setRotation(CRAB_WIGGLE[i] || 0);
      i++;
      if (i >= sequence.length) {
        clearInterval(id);
        setRotation(0);
        playingRef.current = false;
      }
    }, 120);
  };

  useEffect(() => {
    playAnimation();
  }, []);

  return (
    <img
      src={assetPath(CRAB_FRAMES[frame])}
      alt="CUPI Crab"
      className="apply-page__logo"
      style={{ transform: `rotate(${rotation}deg)` }}
      onMouseEnter={playAnimation}
      onTouchStart={playAnimation}
    />
  );
}

function App() {
  const validPages = ['home', 'work', 'about', 'apply'];
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return validPages.includes(hash) ? hash : 'home';
  };
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [formalMode, setFormalMode] = useState(true);
  const [flippedPanels, setFlippedPanels] = useState({ quad: false, hexapod: false, swallow: false });
  const [panelHoverSide, setPanelHoverSide] = useState({ quad: null, hexapod: null, swallow: null });
  const [hoverEnabled, setHoverEnabled] = useState({ quad: true, hexapod: true, swallow: true });
  const [flipDirection, setFlipDirection] = useState({ quad: 'right', hexapod: 'right', swallow: 'right' });
  const [activeBioCard, setActiveBioCard] = useState(null);
  const [teamCardTilt, setTeamCardTilt] = useState({});
  const [showAsciiText, setShowAsciiText] = useState(false);
  const [isCompactHero, setIsCompactHero] = useState(false);
  const [missionTilesPlayed, setMissionTilesPlayed] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const debugCollapseTriggeredRef = useRef(false);
  const scrollLockActiveRef = useRef(false);
  const debugHideTimeoutRef = useRef(null);
  const scrollUnlockTimeoutRef = useRef(null);
  const heroFontFamily = HERO_FONT_FAMILY;
  const heroAsciiConfig = isCompactHero
    ? { asciiFontSize: 7.8, textFontSize: 736, planeBaseHeight: 24, scaleMultiplier: 1.05, verticalOffset: 0.02 }
    : { asciiFontSize: 10.8, textFontSize: 384, planeBaseHeight: 12, scaleMultiplier: 1, verticalOffset: 0 };
  const heroAsciiText = isCompactHero ? 'C\nU\nP\nI' : 'CUPI';
  const heroAsciiLineSpacing = isCompactHero ? 1.08 : 1;
  const heroSubtitleText = '(Cornell University Physical Intelligence)';

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

  const aboutImagePaths = useMemo(() => {
    const paths = new Set();

    const addMemberImages = (member) => {
      if (!member.imageBase) return;
      const base = member.imageBase;
      const formalSuffix = member.formalSuffix ?? '_suit';
      paths.add(assetPath(`img/People/${base}.png`));
      paths.add(assetPath(`img/People/${base}${formalSuffix}.png`));
    };

    TEAM_SECTIONS.forEach(({ members }) => members.forEach(addMemberImages));
    PROFESSORS.forEach(addMemberImages);
    paths.add(assetPath('img/People/Placeholder.png'));

    return Array.from(paths);
  }, []);

  const galleryImagePaths = useMemo(
    () => GALLERY_IMAGES.map((image) => assetPath(`img/Gallery/${image.filename}`)),
    []
  );

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

  useEffect(() => {
    const cancelGallery = preloadImages(galleryImagePaths, { priority: 'low' });
    const cancelProjects = preloadImages(projectImagePaths, { priority: 'low' });
    return () => {
      if (typeof cancelGallery === 'function') cancelGallery();
      if (typeof cancelProjects === 'function') cancelProjects();
    };
  }, [galleryImagePaths, projectImagePaths]);

  useEffect(() => {
    if (!aboutImagePaths.length) return undefined;
    const cancel = preloadImages(aboutImagePaths, { priority: 'low' });
    return typeof cancel === 'function' ? cancel : undefined;
  }, [aboutImagePaths]);

  useEffect(() => {
    if (currentPage === 'about' && aboutImagePaths.length) {
      preloadImages(aboutImagePaths, { priority: 'high' });
    }
    if (currentPage === 'work') {
      preloadImages([...galleryImagePaths, ...projectImagePaths], { priority: 'high' });
    }
  }, [currentPage, aboutImagePaths, galleryImagePaths, projectImagePaths]);

  const handleNavClick = (page) => {
    window.location.hash = page === 'home' ? '' : page;
    setCurrentPage(page);
  };

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('scrolled');
  }, [currentPage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

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

  useEffect(() => {
    // Only enable slow scroll effect on the home page
    if (currentPage !== 'home') {
      return;
    }

    const MOBILE_BREAKPOINT = 640;
    const DEBUG_HIDE_DELAY = 500;
    const SLOW_SCROLL_DURATION = DEBUG_HIDE_DELAY + 150; // Duration of slow phase
    const EASE_OUT_DURATION = 400; // Duration to ease back to normal speed
    const INITIAL_DAMPING = 0.12; // Starting damping (lower = slower)
    const scrollKeys = new Set(['Space', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End', ' ']);
    let lastTouchY = 0;
    let slowScrollStartTime = 0;

    // Check if we're on mobile (no debug animation on mobile)
    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    // Ease-out cubic function for smooth transition
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Calculate current damping based on elapsed time
    const getCurrentDamping = () => {
      if (!slowScrollStartTime) return 1;

      const elapsed = Date.now() - slowScrollStartTime;

      // During initial slow phase, use constant damping
      if (elapsed < SLOW_SCROLL_DURATION) {
        return INITIAL_DAMPING;
      }

      // During ease-out phase, gradually increase damping to 1
      const easeElapsed = elapsed - SLOW_SCROLL_DURATION;
      if (easeElapsed >= EASE_OUT_DURATION) {
        return 1; // Full speed
      }

      const progress = easeElapsed / EASE_OUT_DURATION;
      const easedProgress = easeOutCubic(progress);
      return INITIAL_DAMPING + (1 - INITIAL_DAMPING) * easedProgress;
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
      if ((window.scrollY || window.pageYOffset) === 0) {
        document.body.classList.remove('scrolled');
      }
    };

    const triggerDebugCollapse = () => {
      if (debugCollapseTriggeredRef.current) return;
      debugCollapseTriggeredRef.current = true;

      // Only enable slow scroll on desktop where debug animation exists
      if (!isMobile()) {
        enableSlowScroll();
      }

      document.body.classList.add('scrolled-once');

      debugHideTimeoutRef.current = window.setTimeout(() => {
        document.body.classList.add('debug-hidden');
      }, DEBUG_HIDE_DELAY);

      // Disable slow scroll after both slow phase and ease-out complete (only if not mobile)
      if (!isMobile()) {
        scrollUnlockTimeoutRef.current = window.setTimeout(() => {
          disableSlowScroll();
        }, SLOW_SCROLL_DURATION + EASE_OUT_DURATION);
      }
    };

    const handleWheel = (event) => {
      // Skip slow scroll handling on mobile
      if (isMobile()) return;

      if (!debugCollapseTriggeredRef.current) {
        event.preventDefault();
        triggerDebugCollapse();
        // Apply dampened scroll for this first event
        const dampedDelta = event.deltaY * getCurrentDamping();
        window.scrollBy({ top: dampedDelta, behavior: 'auto' });
      } else if (scrollLockActiveRef.current) {
        // During slow scroll mode, apply dynamic damping
        event.preventDefault();
        const dampedDelta = event.deltaY * getCurrentDamping();
        window.scrollBy({ top: dampedDelta, behavior: 'auto' });
      }
    };

    const handleTouchStart = (event) => {
      // Only track touch on desktop (for trackpad simulation)
      if (isMobile()) return;
      if (event.touches.length > 0) {
        lastTouchY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
      // Skip slow scroll handling on mobile
      if (isMobile()) return;
      if (event.touches.length === 0) return;

      const currentY = event.touches[0].clientY;
      const deltaY = lastTouchY - currentY; // Positive = scroll down
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
      // Skip slow scroll handling on mobile
      if (isMobile()) return;

      const pressedKey = event.code || event.key;
      if (pressedKey && scrollKeys.has(pressedKey)) {
        if (!debugCollapseTriggeredRef.current) {
          event.preventDefault();
          triggerDebugCollapse();
        } else if (scrollLockActiveRef.current) {
          event.preventDefault();
          // Apply small scroll for key presses with current damping
          const keyScrollAmount = 20 * getCurrentDamping();
          const direction = ['ArrowUp', 'PageUp', 'Home'].includes(pressedKey) ? -1 : 1;
          window.scrollBy({ top: keyScrollAmount * direction, behavior: 'auto' });
        }
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
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
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (debugHideTimeoutRef.current) {
        clearTimeout(debugHideTimeoutRef.current);
      }
      if (scrollUnlockTimeoutRef.current) {
        clearTimeout(scrollUnlockTimeoutRef.current);
      }
      document.body.classList.remove('slow-scroll-active');
    };
  }, [currentPage]);

  const getMemberImage = (member) => {
    const base = member.imageBase;
    if (!base) {
      return assetPath('img/People/Placeholder.png');
    }
    const suffix = formalMode ? member.formalSuffix ?? '_suit' : '';
    return assetPath(`img/People/${base}${suffix}.png`);
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const getMemberMeta = (member) => {
    if (member.role) return member.role;
    const year = member.year && member.year !== 'TBD' ? member.year : null;
    if (year) return year;
    return 'Year TBD';
  };
  const clearTeamCardTilt = (cardId) => {
    setTeamCardTilt((prev) => {
      if (!prev[cardId]) return prev;
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const toggleBioCard = (cardId) => {
    setActiveBioCard((prev) => (prev === cardId ? null : cardId));
    clearTeamCardTilt(cardId);
  };

  const clearBioCard = (cardId) => {
    setActiveBioCard((prev) => (prev === cardId ? null : prev));
    clearTeamCardTilt(cardId);
  };

  const handleTeamCardMouseMove = (cardId, event) => {
    if (activeBioCard === cardId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    setTeamCardTilt((prev) => (prev[cardId] === side ? prev : { ...prev, [cardId]: side }));
  };

  useEffect(() => {
    if (currentPage !== 'work') {
      setFlippedPanels({ quad: false, hexapod: false, swallow: false });
      setPanelHoverSide({ quad: null, hexapod: null, swallow: null });
      setHoverEnabled({ quad: true, hexapod: true, swallow: true });
      setFlipDirection({ quad: 'right', hexapod: 'right', swallow: 'right' });
    }
  }, [currentPage]);


  const handlePanelToggle = (panelKey) => {
    setFlippedPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey]
    }));
    setFlipDirection((prev) => ({
      ...prev,
      [panelKey]: panelHoverSide[panelKey] ?? prev[panelKey] ?? 'right'
    }));
    setHoverEnabled((prev) => ({
      ...prev,
      [panelKey]: false
    }));
    setPanelHoverSide((prev) => ({
      ...prev,
      [panelKey]: null
    }));
  };

  const handlePanelMouseLeave = (panelKey) => {
    setPanelHoverSide((prev) => ({
      ...prev,
      [panelKey]: null
    }));
    setHoverEnabled((prev) => ({
      ...prev,
      [panelKey]: true
    }));
  };

  const handlePanelMouseMove = (panelKey, event) => {
    if (!hoverEnabled[panelKey]) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';

    setPanelHoverSide((prev) =>
      prev[panelKey] === side
        ? prev
        : {
          ...prev,
          [panelKey]: side
        }
    );
  };

  const renderAsciiContent = () => (
    <>
      {showAsciiText && (
        <Suspense fallback={null}>
          <ASCIIText
            text={heroAsciiText}
            asciiFontSize={heroAsciiConfig.asciiFontSize}
            textFontSize={heroAsciiConfig.textFontSize}
            planeBaseHeight={heroAsciiConfig.planeBaseHeight}
            enableWaves={false}
            textFontFamily={heroFontFamily}
            lineSpacing={heroAsciiLineSpacing}
            scaleMultiplier={heroAsciiConfig.scaleMultiplier}
            verticalOffset={heroAsciiConfig.verticalOffset}
          />
        </Suspense>
      )}
      <h1 className="main-title no-glass" style={{ fontFamily: heroFontFamily }}>
        CUPI
      </h1>
    </>
  );

  const renderHeroSection = () => {
    if (isCompactHero) {
      return (
        <section className="mobile-hero">
          <div className="mobile-hero__visual">{renderAsciiContent()}</div>
          <p className="mobile-hero__subtitle main-subtitle" style={{ fontFamily: heroFontFamily }}>
            {heroSubtitleText}
          </p>
        </section>
      );
    }

    return (
      <div className="title-wrapper">
        <div className="ascii-logo">
          <div className="ascii-logo__visual">{renderAsciiContent()}</div>
          <p className="main-subtitle" style={{ fontFamily: heroFontFamily }}>
            {heroSubtitleText}
          </p>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div className={`content-section ${isCompactHero ? 'content-section--mobile-hero' : ''}`}>
            {renderHeroSection()}
            <div className="spacer" />
          </div>
          <MissionTiles played={missionTilesPlayed} onPlay={() => setMissionTilesPlayed(true)} />
          <section className="gallery-section">
            <h2 className="section-label">Gallery</h2>
            <div className="gallery-tapestry">
              {GALLERY_IMAGES.map((image, index) => {
                const aspectRatio = image.width && image.height ? `${image.width}/${image.height}` : undefined;

                return (
                  <div
                    className="gallery-item"
                    key={image.filename}
                    onClick={() => setExpandedImage(image)}
                    role="button"
                    tabIndex={0}
                    style={aspectRatio ? { aspectRatio } : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedImage(image);
                      }
                    }}
                  >
                    <img
                      src={assetPath(`img/Gallery/${image.filename}`)}
                      alt={`Concept art ${index + 1}`}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={index < 3 ? 'high' : 'auto'}
                      width={image.width}
                      height={image.height}
                      onLoad={(e) => e.target.classList.add('loaded')}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpandedImage(null)}
              >
                <motion.div
                  className="gallery-lightbox__content"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
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

    if (currentPage === 'work') {
      return (
        <main className="alt-page">
          <section className="alt-section">
            <h2 className="section-label">Current Projects</h2>
            <div className="project-gallery">
              <figure
                className="project-panel"
                tabIndex={0}
                onClick={() => handlePanelToggle('quad')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePanelToggle('quad');
                  }
                }}
                onMouseLeave={() => handlePanelMouseLeave('quad')}
                onMouseMove={(event) => handlePanelMouseMove('quad', event)}
              >
                <div
                  className={`project-panel__flipper ${flipDirection.quad === 'left' ? 'flip-left' : 'flip-right'} ${flippedPanels.quad ? 'is-flipped' : ''
                    } ${panelHoverSide.quad ? `tilt-${panelHoverSide.quad}` : ''}`}
                  data-panel="quad"
                >
                  <div className="project-panel__face project-panel__face--front" data-zoom="in">
                    <img src={assetPath('img/Quad.png')} alt="Project 001 Quad" loading="lazy" />
                    <figcaption className="project-panel__label">Project 001 — Quad</figcaption>
                  </div>
                  <div className="project-panel__face project-panel__face--back">
                    <div className="project-panel__back-content">
                      <p className="project-panel__heading">
                        <span className="project-panel__heading-title">Quadcopter — A family of autonomy focused quadcopters</span>
                        <span className="project-panel__heading-lead">Lead: Andre</span>
                      </p>
                      <div className="project-panel__details">
                        <p>
                          CUPI’s modular quadcopters pair efficient propulsion, onboard compute, and payload-ready hardpoints into an airframe that can jump from
                          mapping flights to data-collection sorties. The large platform
                          keeps future hooks for sharing sensing duties with ground robots while remaining easy to reconfigure for new research payloads.
                        </p>
                        <p>
                          In parallel, a compact indoor drone gives the autonomy team a safe place to train <strong>AI perception</strong>. Six side-mounted cameras and full
                          prop guards let it bounce around hallways while streaming vision back to our lab compute; it is not meant to dock with the larger craft,
                          but to accelerate our model development before we graduate behaviors to the research airframe.
                        </p>
                      </div>
                    </div>
                    <img
                      src={assetPath('img/DroneFlipped.png')}
                      alt="Quadcopter render"
                      className="project-panel__back-image project-panel__back-image--offset-small"
                      loading="lazy"
                    />
                  </div>
                </div>
              </figure>
              <figure
                className="project-panel"
                tabIndex={0}
                onClick={() => handlePanelToggle('hexapod')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePanelToggle('hexapod');
                  }
                }}
                onMouseLeave={() => handlePanelMouseLeave('hexapod')}
                onMouseMove={(event) => handlePanelMouseMove('hexapod', event)}
              >
                <div
                  className={`project-panel__flipper ${flipDirection.hexapod === 'left' ? 'flip-left' : 'flip-right'} ${flippedPanels.hexapod ? 'is-flipped' : ''
                    } ${panelHoverSide.hexapod ? `tilt-${panelHoverSide.hexapod}` : ''}`}
                  data-panel="hexapod"
                >
                  <div className="project-panel__face project-panel__face--front" data-zoom="bird">
                    <img src={assetPath('img/Hexapod.png')} alt="Project 002 Hexapod" loading="lazy" />
                    <figcaption className="project-panel__label">Project 002 — Hexapod</figcaption>
                  </div>
                  <div className="project-panel__face project-panel__face--back">
                    <div className="project-panel__back-content">
                      <p className="project-panel__heading">
                        <span className="project-panel__heading-title">Hexapod — A highly mobile and adaptable legged robot</span>
                        <span className="project-panel__heading-lead">Lead: Alan</span>
                      </p>
                      <div className="project-panel__details">
                        <p>
                          The hexapod extends Cornell’s beach-cleaning research into a <strong>bio-inspired legged system</strong>, keeping most of the mass concentrated
                          near the core for efficiency. A <strong>Jetson Nano</strong> rides onboard for machine-vision inference and field autonomy so the platform can run
                        </p>
                        <p>
                          Each 3DOF limb relies on <strong>tendon-style linkages</strong>, clustering three servos at the first joint while mechanically transmitting motion
                          to the outer joints. That layout simplifies manufacturing, protects the actuators, and still gives the legs the travel they need to
                          navigate uneven surfaces before handing sensor data back to the aerial systems.
                        </p>
                      </div>
                    </div>
                    <img
                      src={assetPath('img/LegFlipped.png')}
                      alt="Hexapod prototype render"
                      className="project-panel__back-image project-panel__back-image--offset"
                      loading="lazy"
                    />
                  </div>
                </div>
              </figure>
              <figure
                className="project-panel"
                tabIndex={0}
                onClick={() => handlePanelToggle('swallow')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handlePanelToggle('swallow');
                  }
                }}
                onMouseLeave={() => handlePanelMouseLeave('swallow')}
                onMouseMove={(event) => handlePanelMouseMove('swallow', event)}
              >
                <div
                  className={`project-panel__flipper ${flipDirection.swallow === 'left' ? 'flip-left' : 'flip-right'} ${flippedPanels.swallow ? 'is-flipped' : ''
                    } ${panelHoverSide.swallow ? `tilt-${panelHoverSide.swallow}` : ''}`}
                  data-panel="swallow"
                >
                  <div className="project-panel__face project-panel__face--front project-panel__face--placeholder">
                    <span className="project-panel__placeholder">[?]</span>
                    <figcaption className="project-panel__label">Project 003 — Tunnel</figcaption>
                  </div>
                  <div className="project-panel__face project-panel__face--back">
                    <div className="project-panel__back-content">
                      <p className="project-panel__heading">
                        <span className="project-panel__heading-title">Coming soon</span>
                        <span className="project-panel__heading-lead">Lead: TBA</span>
                      </p>
                      <div className="project-panel__details project-panel__details--icon-only">
                      </div>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </section>
          <SiteFooter />
        </main>
      );
    }

    if (currentPage === 'about') {
      return (
        <main className="alt-page">
          <section className="alt-section alt-section--team">
            <div className="alt-section__title-row">
              <h2 className="alt-section__title">Our Team</h2>
              <label className={`formal-toggle ${formalMode ? 'formal-toggle--active' : ''}`}>
                <input
                  type="checkbox"
                  checked={formalMode}
                  onChange={() => setFormalMode((prev) => !prev)}
                  aria-label="Toggle formal portraits"
                />
                <span className="formal-toggle__track">
                  <span className="formal-toggle__thumb" />
                </span>
                <span className="formal-toggle__text">Formal Mode</span>
              </label>
            </div>
            <div className="team-sections">
              {TEAM_SECTIONS.map((section) => (
                <div className="team-section" key={section.title}>
                  <div className="team-section__header">
                    <h3>{section.title}</h3>
                  </div>
                  <div className="team-grid">
                    {section.members.map((member) => {
                      const photoSrc = getMemberImage(member);
                      const bio = member.bio ?? BIO_PLACEHOLDER;
                      const isPlaceholderBio = bio === BIO_PLACEHOLDER;
                      const cardId = `${section.title}-${member.name}`;
                      const isFlipped = activeBioCard === cardId;
                      const meta = getMemberMeta(member);

                      return (
                        <article
                          className={`team-card ${isFlipped ? 'is-flipped' : ''} ${teamCardTilt[cardId] ? `tilt-${teamCardTilt[cardId]}` : ''
                            }`}
                          key={member.name}
                          data-project={member.project ? `currently working on: ${member.project}` : undefined}
                          tabIndex={0}
                          onClick={() => toggleBioCard(cardId)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleBioCard(cardId);
                            }
                          }}
                          onMouseMove={(event) => handleTeamCardMouseMove(cardId, event)}
                          onMouseLeave={() => clearTeamCardTilt(cardId)}
                          onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                              clearBioCard(cardId);
                            }
                          }}
                        >
                          <div className="team-card__flipper">
                            <div className="team-card__face team-card__face--front">
                              <div className="team-card__photo">
                                {photoSrc ? (
                                  <img src={photoSrc} alt={member.name} loading="lazy" />
                                ) : (
                                  <span className="team-card__photo-placeholder">{getInitials(member.name)}</span>
                                )}
                              </div>
                              <div className="team-card__body">
                                <p className="team-card__name">{member.name}</p>
                                <p className="team-card__meta">{meta}</p>
                              </div>
                            </div>
                            <div className="team-card__face team-card__face--back">
                              <p className={`team-card__bio ${isPlaceholderBio ? 'team-card__bio--placeholder' : ''}`}>
                                {bio}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="team-section team-section--professors">
                <div className="team-section__header">
                  <h3>Faculty</h3>
                </div>
                <div className="team-grid team-grid--professors">
                  {PROFESSORS.map((prof) => {
                    const photoSrc = getMemberImage(prof);
                    const bio = prof.bio ?? BIO_PLACEHOLDER;
                    const isPlaceholderBio = bio === BIO_PLACEHOLDER;
                    const cardId = `Faculty-${prof.name}`;
                    const isFlipped = activeBioCard === cardId;
                    const meta = getMemberMeta(prof);

                    return (
                      <article
                        className={`team-card ${isFlipped ? 'is-flipped' : ''} ${teamCardTilt[cardId] ? `tilt-${teamCardTilt[cardId]}` : ''
                          }`}
                        key={prof.name}
                        tabIndex={0}
                        onClick={() => toggleBioCard(cardId)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggleBioCard(cardId);
                          }
                        }}
                        onMouseMove={(event) => handleTeamCardMouseMove(cardId, event)}
                        onMouseLeave={() => clearTeamCardTilt(cardId)}
                        onBlur={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget)) {
                            clearBioCard(cardId);
                          }
                        }}
                      >
                        <div className="team-card__flipper">
                          <div className="team-card__face team-card__face--front">
                            <div className="team-card__photo">
                              {photoSrc ? (
                                <img src={photoSrc} alt={prof.name} loading="lazy" />
                              ) : (
                                <span className="team-card__photo-placeholder">{getInitials(prof.name)}</span>
                              )}
                            </div>
                            <div className="team-card__body">
                              <p className="team-card__name">{prof.name}</p>
                              <p className="team-card__meta">{meta}</p>
                            </div>
                          </div>
                          <div className="team-card__face team-card__face--back">
                            <p className={`team-card__bio ${isPlaceholderBio ? 'team-card__bio--placeholder' : ''}`}>
                              {bio}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
          <SiteFooter />
        </main>
      );
    }

    // Apply page content
    if (currentPage === 'apply') {
      return (
        <main className="alt-page">
          <section className="alt-section alt-section--apply">
            <div className="apply-page">
              <CrabAnimation />
              <p className="apply-page__thank-you">Thanks for your interest in CUPI! We'd love to get to know you. Grab a coffee chat with one of our members and complete the application form.</p>
              <div className="apply-timeline">
                <div className="apply-timeline__node">
                  <div className="apply-timeline__content">
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSeAoHRH3jaqJc02cI7wYN-ZaQOSK6Ygou9UtXYAYbXwWh0rRQ/viewform" target="_blank" rel="noopener noreferrer" className="apply-timeline__link">
                      Schedule a Coffee Chat
                    </a>
                    <p className="apply-timeline__desc">Talk one-on-one with a member to learn more about our projects and culture.</p>
                  </div>
                </div>
                <div className="apply-timeline__connector"></div>
                <div className="apply-timeline__node">
                  <div className="apply-timeline__content">
                    <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="apply-timeline__link">
                      Application Form
                    </a>
                    <p className="apply-timeline__desc">Share your background and interests so we can match you with the right projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <SiteFooter />
        </main>
      );
    }

    return null;
  };

  return (
    <div className={`demo-container ${expandedImage ? 'lightbox-open' : ''}`}>
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
              className={`menu-item ${currentPage === 'work' ? 'active' : ''}`}
            >
              WORK
            </button>
            <button
              onClick={() => handleNavClick('about')}
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
