import { useEffect, useRef, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import { assetPath } from '../utils/assetPath';
import { APPLY_URL } from '../data/projects';

const CRAB_FRAMES = [
  'icons/logo-1.svg',
  'icons/logo-2.svg',
  'icons/logo-3.svg',
];

const CRAB_WIGGLE = [0, 4, -4, 3, -3, 0];

function CrabAnimation() {
  const [frame, setFrame] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
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

  useEffect(() => {
    CRAB_FRAMES.forEach((src) => {
      const img = new Image();
      img.src = assetPath(src);
    });
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      setShowLoading(false);
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setShowLoading(true);
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [hasLoaded]);

  return (
    <div className={`apply-page__logo-wrap ${hasLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!hasLoaded && showLoading && <span className="apply-page__logo-loading">Crab Loading...</span>}
      <img
        src={assetPath(CRAB_FRAMES[frame])}
        alt="CUPI Crab"
        className="apply-page__logo"
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseEnter={playAnimation}
        onTouchStart={playAnimation}
        onLoad={() => {
          setHasLoaded(true);
          setShowLoading(false);
        }}
        onError={() => {
          setHasLoaded(true);
          setShowLoading(false);
        }}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}

function ApplyPage() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const handleEmailClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('ab3233@cornell.edu');
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="alt-page alt-page--apply">
      <section className="alt-section alt-section--apply">
        <div className="apply-page">
          <CrabAnimation />
          <p className="apply-page__thank-you">Applications are currently closed. If you really want to be considered, email{' '}
            <span className="apply-page__email-wrap">
              <button className="apply-page__email" onClick={handleEmailClick}>ab3233@cornell.edu</button>
              <span className={`apply-page__copied ${copied ? 'is-visible' : ''}`}>copied!</span>
            </span>.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export default ApplyPage;
