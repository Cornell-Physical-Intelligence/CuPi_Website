import HoverVideo from '../components/HoverVideo';
import TechnicalReports from '../components/TechnicalReports';
import SiteFooter from '../components/SiteFooter';
import { WORK_AREAS, normalizedWorkSummary } from '../data/workAreas';
import { assetPath } from '../utils/assetPath';
import './Work.css';

// The two areas the team's work splits into, stacked one over another. Each area is a
// label, a pair of hover-to-play clips, a short summary, and any partner mark.
//
// `ratio` is per-area because the source footage differs: the arm clips are encoded
// square, the drone clips 4:3. Forcing the drone pair into a square tile would crop the
// gate-detection telemetry off the edges of the frame.
//
// The `-960` clips are the served re-encodes (see scripts/build-assets.mjs); the masters
// they came from sit beside them in public/media and are never requested.
export default function Work() {
  return (
    <main className="alt-page">
      <h1 className="visually-hidden">Robotics Projects and Technical Reports</h1>
      <TechnicalReports />

      <section className="work-stack">
        {WORK_AREAS.map((area) => (
          <article className="work-area" key={area.title}>
            <h2 className="section-label">{area.title}</h2>

            <div className="work-area__clips">
              {area.clips.map((clip) => (
                <HoverVideo key={clip.src} {...clip} ratio={area.ratio} />
              ))}
            </div>

            <p className="work-area__summary">{normalizedWorkSummary(area)}</p>

            {area.partner && (
              <div className="work-area__footer">
                <a
                  className="work-area__partner"
                  href={area.partner.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={area.partner.alt}
                >
                  <img draggable={false} src={assetPath(area.partner.src)} alt={area.partner.alt} loading="lazy" />
                </a>
              </div>
            )}
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
