import SiteFooter from '../components/SiteFooter';
import { REPORT_BY_SLUG } from '../data/reportContent';
import { getReportPdf } from '../data/reports';
import './ReportPage.css';

export default function ReportPage({ slug }) {
  const report = REPORT_BY_SLUG[slug];
  if (!report) return null;

  return (
    <main className="alt-page report-page">
      <article className="report-article">
        <header className="report-article__header">
          <p className="report-article__eyebrow">
            CUPI Technical Report · {report.year} · {report.authors} · Updated{' '}
            <time dateTime={report.lastModified}>{report.lastModifiedLabel}</time>
          </p>
          <h1 className="report-article__title">{report.title}</h1>
          <p className="report-article__lede">{report.description}</p>
          <div className="report-article__actions">
            <a href={getReportPdf(report.slug)} target="_blank" rel="noreferrer">
              Read the full PDF ({report.pageCount} pages)
            </a>
            <a href="/work/">All CUPI robotics projects</a>
          </div>
        </header>

        <div className="report-article__body">
          {report.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="report-article__footer">
          <p>
            This is a CUPI technical report, not a peer-reviewed publication. The PDF is
            the complete report of record.
          </p>
          <a href={getReportPdf(report.slug)} target="_blank" rel="noreferrer">
            Download {report.cardTitle}
          </a>
        </footer>
      </article>
      <SiteFooter />
    </main>
  );
}
