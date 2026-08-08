import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PUBLICATIONS,
  getPublicationCover,
  getPublicationPage,
  getPublicationPdf,
} from '../data/publications';
import './Publications.css';

// Papers, sitting above the gallery and following its conventions: the same eyebrow
// label, the same shimmer-then-fade-in tile treatment, and the same lightbox shell.
// The difference is what the lightbox holds — a scrollable stack of page renders rather
// than a single image.
export default function Publications() {
  const [openPub, setOpenPub] = useState(null);

  // Blur the glass bar (shared with the gallery) and lock the page behind the viewer, so
  // a scroll gesture inside the modal can't chain through to the document underneath.
  useEffect(() => {
    document.body.classList.toggle('lightbox-open', !!openPub);
    document.body.classList.toggle('pub-viewer-open', !!openPub);
    return () => {
      document.body.classList.remove('lightbox-open');
      document.body.classList.remove('pub-viewer-open');
    };
  }, [openPub]);

  useEffect(() => {
    if (!openPub) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenPub(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openPub]);

  if (PUBLICATIONS.length === 0) return null;

  return (
    <>
      <section className="pubs-section">
        <h2 className="section-label">Publications</h2>
        <div className="pubs-grid">
          {PUBLICATIONS.map((pub) => (
            <article className="pub-card" key={pub.slug}>
              <div
                className="pub-card__cover"
                role="button"
                tabIndex={0}
                aria-label={`Open ${pub.title}`}
                onClick={() => setOpenPub(pub)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenPub(pub);
                  }
                }}
              >
                <img
                  src={getPublicationCover(pub.slug)}
                  alt={`First page of ${pub.title}`}
                  loading="lazy"
                  decoding="async"
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
              <div className="pub-card__meta">
                <h3 className="pub-card__title">{pub.title}</h3>
                <p className="pub-card__subtitle">{pub.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {openPub && (
          <motion.div
            className="pub-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={openPub.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenPub(null)}
          >
            <div className="pub-viewer__bar" onClick={(e) => e.stopPropagation()}>
              <span className="pub-viewer__name">{openPub.title}</span>
              <span className="pub-viewer__actions">
                {/* Glyph, not the word "PDF": you are already looking at the paper, so
                    the only thing worth saying here is that this fetches the file. */}
                <a
                  className="pub-viewer__download"
                  href={getPublicationPdf(openPub.slug)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download the PDF"
                  title="Download PDF"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M12 3v12" />
                    <polyline points="7 10 12 15 17 10" />
                    <path d="M4 20h16" />
                  </svg>
                </a>
                <button
                  className="pub-viewer__close"
                  onClick={() => setOpenPub(null)}
                  aria-label="Close paper"
                  type="button"
                >
                  &times;
                </button>
              </span>
            </div>

            {/* The scroll container. stopPropagation keeps a click on a page from
                reaching the backdrop's close handler. */}
            <motion.div
              className="pub-viewer__scroll"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {Array.from({ length: openPub.pageCount }, (_, i) => (
                <img
                  key={i}
                  className="pub-viewer__page"
                  src={getPublicationPage(openPub.slug, i + 1)}
                  alt={`Page ${i + 1} of ${openPub.pageCount}`}
                  /* Only the opening spread is worth blocking on; the rest stream in
                     as the reader scrolls, which keeps the modal cheap to open. */
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
