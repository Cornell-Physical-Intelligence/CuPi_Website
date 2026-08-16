import HoverVideo from '../components/HoverVideo';
import TechnicalReports from '../components/TechnicalReports';
import SiteFooter from '../components/SiteFooter';
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
const WORK_AREAS = [
  {
    title: 'Robotic Manipulation Tasks',
    ratio: '1 / 1',
    clips: [
      {
        src: '/media/arm-ball-960.mp4',
        poster: 'arm-ball',
        label: 'Play: a 3D-printed arm picking up a ball',
      },
      {
        src: '/media/arm-meat-960.mp4',
        poster: 'arm-meat',
        label: 'Play: a robot arm cutting on a processing line',
      },
    ],
    summary: `The clips above are our fine-tuned π0.5 policy running on our own arm.
      π0.5 is Physical Intelligence's open vision-language-action model, so we are not
      training from scratch: the released checkpoint brings broad manipulation priors
      from web and robot data, and our work is adapting it to the grippers, camera
      placement, and tasks in our lab.`,
  },
  {
    title: 'Autonomous Perception and Navigation',
    ratio: '4 / 3',
    clips: [
      {
        src: '/media/drone-sim-960.mp4',
        poster: 'drone-sim',
        label: 'Play: a quadrotor flying a simulated race course',
      },
      {
        src: '/media/drone-gates-960.mp4',
        poster: 'drone-gates',
        label: 'Play: an FPV replay showing gate detections and live telemetry',
      },
    ],
    summary: `We build the autonomy stack for the Anduril AI Grand Prix, an autonomous
      drone racing competition run with the Drone Champions League. We passed Virtual
      Qualifier 1 with a fully deterministic policy: no learned network anywhere in the
      loop, just dead reckoning against the released course map with visual gate
      corrections. Virtual Qualifier 2 blocks every pose and gate telemetry stream,
      leaving a monocular camera and IMU, so the policy now guides on bearings alone and
      reads closing rate from optical looming.`,
    partner: {
      href: 'https://theaigrandprix.com/',
      src: 'icons/ai-gp-logo-orange.svg',
      alt: 'AI Grand Prix',
    },
  },
];

export default function Work() {
  return (
    <main className="alt-page">
      <header className="work-intro">
        <div className="page-head">
          <h1 className="page-title">Robotics Projects</h1>
        </div>
        <p className="work-intro__summary">
          Cornell Physical Intelligence (CUPI) builds intelligent robotic systems for
          manipulation, autonomous perception, and navigation at Cornell University.
        </p>
      </header>

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

            <p className="work-area__summary">{area.summary.replace(/\s+/g, ' ').trim()}</p>

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
