import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  REPORTS,
  getReportCover,
  getReportCoverSet,
  getReportPage,
  getReportPdf,
} from '../data/reports';
import './TechnicalReports.css';

// Technical reports, sitting above the gallery and following its conventions: the same
// eyebrow label, the same shimmer-then-fade-in tile treatment, and the same lightbox
// shell. The difference is what the lightbox holds — a scrollable stack of page renders
// rather than a single image.
export default function TechnicalReports() {
  const [openReport, setOpenReport] = useState(null);

  // Blur the glass bar (shared with the gallery) and lock the page behind the viewer, so
  // a scroll gesture inside the modal can't chain through to the document underneath.
  useEffect(() => {
    document.body.classList.toggle('lightbox-open', !!openReport);
    document.body.classList.toggle('report-viewer-open', !!openReport);
    return () => {
      document.body.classList.remove('lightbox-open');
      document.body.classList.remove('report-viewer-open');
    };
  }, [openReport]);

  useEffect(() => {
    if (!openReport) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenReport(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openReport]);

  if (REPORTS.length === 0) return null;

  return (
    <>
      <section className="reports-section">
        <h2 className="section-label">Technical Reports</h2>
        <div className="reports-grid">
          {REPORTS.map((report) => (
            <article className="report-card" key={report.slug}>
              <div
                className="report-card__cover"
                role="button"
                tabIndex={0}
                aria-label={`Open ${report.title}`}
                onClick={() => setOpenReport(report)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenReport(report);
                  }
                }}
              >
                {/* Not lazy. These sit below the fold, so lazy loading held the request
                    until the scroll almost reached them and the fade-in then waited on a
                    cold fetch. Loading eagerly at low priority starts them with the page
                    without competing with the hero, so they are decoded before arrival. */}
                <picture>
                  <source
                    type="image/avif"
                    srcSet={getReportCoverSet(report.slug, 'avif')}
                    sizes="240px"
                  />
                  <source
                    type="image/webp"
                    srcSet={getReportCoverSet(report.slug, 'webp')}
                    sizes="240px"
                  />
                  <img
                    draggable={false}
                    src={getReportCover(report.slug)}
                    alt={`First page of ${report.title}`}
                    width={240}
                    height={311}
                    decoding="async"
                    fetchPriority="low"
                    /* closest(), not parentElement: the parent is now <picture>, and the
                       skeleton sweep lives on the cover div outside it. */
                    onLoad={(e) => {
                      e.currentTarget.classList.add('loaded');
                      e.currentTarget.closest('.report-card__cover')?.classList.add('is-loaded');
                    }}
                    onError={(e) => {
                      e.currentTarget.classList.add('loaded');
                      e.currentTarget.closest('.report-card__cover')?.classList.add('is-loaded');
                    }}
                  />
                </picture>
              </div>
              <div className="report-card__meta">
                <h3 className="report-card__title">{report.title}</h3>
                <p className="report-card__subtitle">{report.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {openReport && (
          <motion.div
            className="report-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={openReport.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenReport(null)}
          >
            <div className="report-viewer__bar" onClick={(e) => e.stopPropagation()}>
              <span className="report-viewer__name">{openReport.title}</span>
              <span className="report-viewer__actions">
                {/* Glyph, not the word "PDF": you are already looking at the report, so
                    the only thing worth saying here is that this fetches the file. */}
                <a
                  className="report-viewer__download"
                  href={getReportPdf(openReport.slug)}
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
                  className="report-viewer__close"
                  onClick={() => setOpenReport(null)}
                  aria-label="Close report"
                  type="button"
                >
                  &times;
                </button>
              </span>
            </div>

            {/* The scroll container. stopPropagation keeps a click on a page from
                reaching the backdrop's close handler. */}
            <motion.div
              className="report-viewer__scroll"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {Array.from({ length: openReport.pageCount }, (_, i) => (
                <img
                  draggable={false}
                  key={i}
                  className="report-viewer__page"
                  src={getReportPage(openReport.slug, i + 1)}
                  alt={`Page ${i + 1} of ${openReport.pageCount}`}
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
