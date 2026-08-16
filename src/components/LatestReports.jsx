import { REPORT_CONTENT } from '../data/reportContent';
import './LatestReports.css';

export default function LatestReports() {
  return (
    <section className="latest-reports" aria-labelledby="latest-reports-heading">
      <header className="latest-reports__header">
        <p className="latest-reports__eyebrow">Original CUPI technical work</p>
        <h2 className="section-label" id="latest-reports-heading">
          Latest technical reports
        </h2>
        <p className="latest-reports__intro">
          Read the methods, results, constraints, and next steps behind our autonomous
          drone-racing work.
        </p>
      </header>

      <div className="latest-reports__grid">
        {REPORT_CONTENT.map((report) => (
          <article className="latest-report" key={report.slug}>
            <a className="latest-report__link" href={report.path}>
              <p className="latest-report__meta">
                CUPI technical report · {report.year} · {report.pageCount} pages
              </p>
              <h3 className="latest-report__title">{report.title}</h3>
              <p className="latest-report__summary">{report.cardSubtitle}</p>
              <span className="latest-report__action">
                Read the report <span aria-hidden="true">→</span>
              </span>
            </a>
          </article>
        ))}
      </div>

      <a className="latest-reports__all" href="/work/">
        Explore all CUPI robotics projects and reports
      </a>
    </section>
  );
}
