export const REPORT_CONTENT = [
  {
    pageKey: 'vq1Report',
    slug: 'vq1-deterministic-policy',
    path: '/work/vq1-deterministic-policy/',
    cardTitle: 'Anduril AI-GP Qual 1',
    cardSubtitle:
      "Clearing every gate of Anduril's first autonomous drone-racing qualifier with no learned components.",
    title:
      'Passing Every Gate Without Learning: A Deterministic Policy for AI Grand Prix VQ1',
    metaTitle: 'Deterministic AI Grand Prix VQ1 Policy | CUPI',
    description:
      'How CUPI cleared all six AI Grand Prix VQ1 gates with deterministic dead reckoning, monocular corrections, and no learned policy component.',
    authors: 'AI-GP Autonomy Team',
    year: 2026,
    lastModified: '2026-08-16',
    lastModifiedLabel: 'August 16, 2026',
    pageCount: 3,
    image: '/img/Reports/vq1-deterministic-policy-cover-720.webp',
    highlights: [
      'Cleared all six Virtual Qualifier 1 gates in order',
      'Used deterministic control with no learned component',
      'Combined monocular gate-size and bearing corrections with an admissible scored-event timing signal',
    ],
    sections: [
      {
        heading: 'Result',
        paragraphs: [
          'The policy passed Virtual Qualifier 1 of the Anduril AI Grand Prix, clearing all six gates in order. It is deterministic: from the same start state and configuration it produces the same command sequence, making scarce qualification attempts reproducible.',
        ],
      },
      {
        heading: 'Policy architecture',
        paragraphs: [
          'The controller integrates reported body-frame velocity and attitude into a position estimate, aims through the released six-gate course geometry, and publishes collective-thrust-and-body-rate commands at 50 Hz. Three independent correction channels keep accumulated drift and gate bookkeeping bounded.',
        ],
        bullets: [
          'Apparent gate size provides an absolute position correction against known gate geometry.',
          'Gate bearing adds a direct visual-servo correction during the final approach.',
          'The elapsed-time-since-last-gate signal resynchronizes the active gate index after a scored pass.',
        ],
      },
      {
        heading: 'Deploy boundary',
        paragraphs: [
          'The deployed policy reads only the admissible observation frame and camera image. It does not consume privileged simulator state, privileged scorer outputs, collision flags, or oracle pose; it does use the admissible elapsed-time-since-last-gate signal. A content-addressed manifest fixes the course revision, controller, and tuned parameters for every promoted run.',
        ],
      },
      {
        heading: 'Why VQ2 requires a different system',
        paragraphs: [
          'Virtual Qualifier 2 removes attitude, local position, odometry, and gate telemetry. Those restrictions invalidate the mapped dead-reckoning approach rather than merely requiring new tuning. CUPI’s successor work therefore guides from image bearings and optical looming without a surveyed map.',
        ],
      },
    ],
  },
  {
    pageKey: 'racingReport',
    slug: 'racing-without-a-map',
    path: '/work/racing-without-a-map/',
    cardTitle: 'Racing Without a Map',
    cardSubtitle:
      'A survey of roughly 400 works on drone control, perception, and guidance under blocked telemetry.',
    title:
      'Racing Without a Map: Bearings-Only Guidance and Optical Looming for Autonomous Drone Racing',
    metaTitle: 'Racing Without a Map | CUPI Technical Report',
    description:
      'CUPI’s technical survey of camera-and-IMU drone racing, bearings-only guidance, optical looming, control-rate limits, and mapless system design.',
    authors: 'AI-GP Autonomy Team',
    year: 2026,
    lastModified: '2026-08-16',
    lastModifiedLabel: 'August 16, 2026',
    pageCount: 16,
    image: '/img/Reports/racing-without-a-map-cover-720.webp',
    highlights: [
      'Classifies roughly 400 works spanning 1958–2026',
      'Finds only four published systems using camera and IMU without odometry or a map',
      'Uses a conservative surrogate loop period to expose control-rate sensitivity',
    ],
    sections: [
      {
        heading: 'Research question',
        paragraphs: [
          'How should an autonomous racing drone traverse a single fixed but unsurveyed course when pose, odometry, official gate state, and surveyed gate coordinates are all blocked? The admissible agent receives a monocular 640 × 360 camera, inertial measurements, timing signals, and its own command history.',
        ],
      },
      {
        heading: 'Literature findings',
        paragraphs: [
          'The report surveys roughly 400 works spanning 1958–2026 and applies explicit admissibility filters. Only four published systems operate with camera and IMU but without odometry or a map; the leading monocular racing systems still depend on a track map and cannot transfer unchanged.',
          'Four mature research lines already solve parts of the problem—optical time-to-contact guidance, bearings-only gap traversal, image-based visual servoing, and image-space flight through openings—but the survey finds no prior system joining them for autonomous racing.',
        ],
      },
      {
        heading: 'A control-rate limit before policy design',
        paragraphs: [
          'Using a conservative 0.109-second surrogate control period, a drone moving at 8 m/s would travel 0.87 meters between decisions. Compared with a 0.61-meter gate half-width, that surrogate yields a 5.6 m/s clearance bound and shows why control rate must be measured before policy design. The report notes that a roughly 30 Hz live loop would raise the bound to about 18 m/s and make it nonbinding.',
        ],
      },
      {
        heading: 'Proposed mapless system',
        paragraphs: [
          'The proposed architecture combines a deterministic bearings-only and optical-looming expert, a drag-aware attitude estimator, gate-corner reprojection in an error-state filter, and a speed-conditioned recurrent policy. Multi-fidelity Bayesian optimization specializes the system to the fixed course under a three-attempt qualification budget.',
        ],
      },
    ],
  },
];

export const REPORT_BY_SLUG = Object.fromEntries(
  REPORT_CONTENT.map((report) => [report.slug, report]),
);

export const REPORT_BY_PAGE = Object.fromEntries(
  REPORT_CONTENT.map((report) => [report.pageKey, report]),
);
