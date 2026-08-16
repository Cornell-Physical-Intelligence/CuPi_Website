import { useEffect, useState } from 'react';
import Overlay from './Overlay';
import ResponsiveImage from './ResponsiveImage';
import {
  REPORTS,
  REPORT_PAGE_SIZES,
  getReportCover,
  getReportCoverSet,
  getReportPageGroup,
  getReportPageName,
  getReportPdf,
} from '../data/reports';
import './TechnicalReports.css';

// Technical reports, sitting above the gallery and following its conventions: the same
// eyebrow label, the same shimmer-then-fade-in tile treatment, and the same lightbox
// shell. The difference is what the lightbox holds — a scrollable stack of page renders
// rather than a single image.
export default function TechnicalReports() {
  const [openReport, setOpenReport] = useState(null);
  // What was open when the viewer started closing, so it still has a report to draw while
  // it fades out. Escape is handled by Overlay.
  const [closingReport, setClosingReport] = useState(null);
  const shown = openReport ?? closingReport;

  const closeViewer = () => {
    setClosingReport(openReport);
    setOpenReport(null);
  };

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
                <h3 className="report-card__title">
                  <a href={report.path}>
                    {report.title}
                  </a>
                </h3>
                <p className="report-card__subtitle">{report.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Overlay
        open={Boolean(openReport)}
        onClose={closeViewer}
        className="report-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={shown?.title}
      >
        {shown && (
          <>
            <div className="report-viewer__bar" onClick={(e) => e.stopPropagation()}>
              <span className="report-viewer__name">{shown.title}</span>
              <span className="report-viewer__actions">
                {/* Glyph, not the word "PDF": you are already looking at the report, so
                    the only thing worth saying here is that this fetches the file. */}
                <a
                  className="report-viewer__download"
                  href={getReportPdf(shown.slug)}
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
                  onClick={closeViewer}
                  aria-label="Close report"
                  type="button"
                >
                  &times;
                </button>
              </span>
            </div>

            {/* The scroll container. stopPropagation keeps a click on a page from
                reaching the backdrop's close handler. */}
            <div
              className="report-viewer__scroll"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Only the opening spread is worth blocking on; the rest stream in as the
                  reader scrolls. That was always the intent, but it did not happen: an
                  <img> with no width or height is zero pixels tall until its bytes land,
                  so all sixteen pages stacked inside one screen, every one of them counted
                  as near the viewport, and `loading="lazy"` fetched the entire report on
                  open — 2.8MB to read page one. ResponsiveImage carries the encoded
                  dimensions, which gives each page a real height before it loads and lets
                  the browser defer the ones genuinely further down. */}
              {Array.from({ length: shown.pageCount }, (_, i) => (
                <ResponsiveImage
                  key={i}
                  group={getReportPageGroup(shown.slug)}
                  name={getReportPageName(i + 1)}
                  sizes={REPORT_PAGE_SIZES}
                  className="report-viewer__page"
                  alt={`Page ${i + 1} of ${shown.pageCount}`}
                  draggable={false}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              ))}
            </div>
          </>
        )}
      </Overlay>
    </>
  );
}
