// The OFF-SEASON Apply page: the crab and one line of copy, exactly as the
// site shipped before the interest form existed. Do not rewrite or restyle
// this — it is finished. The live variant is chosen by APPLY_ACTIVE in
// Apply.jsx (see README, "Apply page: open vs closed").
import { useEffect, useRef, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import ResponsiveImage from '../components/ResponsiveImage';
import { APPLY_ART_PICTURES } from '../data/applyArt';
import './Apply.css';
import './ApplyClosed.css';

// The crab is most of what this page is, so it keeps the delayed loading label the frames
// had. Only admit to loading if it is actually slow — a fast load should never flash text.
function CrabPicture() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (hasLoaded) return undefined;
    const timeoutId = window.setTimeout(() => {
      setShowLoading(true);
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [hasLoaded]);

  return (
    <div className={`apply-page__logo-wrap ${hasLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!hasLoaded && showLoading && <span className="apply-page__logo-loading">Crab Loading...</span>}
      {/* On the closed page the crab is the largest contentful paint again, so it
          keeps high priority. Drawn at min(520px, 88vw, 62vh). */}
      <ResponsiveImage
        sources={APPLY_ART_PICTURES.CrabOnBeach}
        sizes="(max-width: 590px) 88vw, 520px"
        alt="The CUPI crab on a beach"
        className="apply-page__logo"
        draggable={false}
        onLoad={() => setHasLoaded(true)}
        onError={() => setHasLoaded(true)}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}

const CONTACT_EMAIL = 'ab3233@cornell.edu';

export default function ApplyClosed() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(timeoutRef.current);
  }, []);

  const copyEmail = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      return;
    }

    // execCommand fallback for non-secure contexts, where the Clipboard API is absent.
    const input = document.createElement('textarea');
    input.value = CONTACT_EMAIL;
    input.setAttribute('readonly', '');
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  };

  const handleEmailClick = async () => {
    try {
      await copyEmail();
      setCopied(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="alt-page alt-page--apply apply-closed">
      <h1 className="visually-hidden">Cornell Physical Intelligence Applications</h1>
      <section className="alt-section alt-section--apply">
        <div className="apply-page">
          <CrabPicture />
          <p className="apply-page__thank-you">
            Unfortunately, applications are closed right now. If you&apos;re really curious, email{' '}
            <span className="apply-page__email-wrap">
              <button className="apply-page__email" onClick={handleEmailClick} type="button">
                {CONTACT_EMAIL}
              </button>
              <span className={`apply-page__copied ${copied ? 'is-visible' : ''}`}>copied!</span>
            </span>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
