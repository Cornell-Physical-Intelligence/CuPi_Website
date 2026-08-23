export const REPORT_METADATA = [
  {
    pageKey: 'vq1Report',
    slug: 'vq1-deterministic-policy',
    path: '/work/vq1-deterministic-policy/',
    cardTitle: 'Anduril AI-GP Qual 1',
    cardSubtitle:
      "Clearing every gate of the first qualifier in Anduril's autonomous drone racing competition, with no learned components.",
    title:
      'Passing Every Gate Without Learning: A Deterministic Policy for AI Grand Prix VQ1',
    metaTitle: 'Deterministic AI Grand Prix VQ1 Policy | CUPI',
    description:
      'How CUPI cleared all six AI Grand Prix VQ1 gates with deterministic dead reckoning, monocular corrections, and no learned policy component.',
    authors: 'AI-GP Autonomy Team',
    year: 2026,
    publishedAt: '2026-08-16T18:27:42-04:00',
    modifiedAt: '2026-08-16T18:27:42-04:00',
    lastModified: '2026-08-16',
    lastModifiedLabel: 'August 16, 2026',
    pageCount: 3,
    image: '/img/Reports/vq1-deterministic-policy-cover-720.webp',
    imageWidth: 720,
    imageHeight: 932,
  },
  {
    pageKey: 'racingReport',
    slug: 'racing-without-a-map',
    path: '/work/racing-without-a-map/',
    cardTitle: 'Racing Without a Map',
    cardSubtitle:
      'A meta analysis of roughly 400 papers on drone control, perception, and guidance, and what survives when a racing drone loses all telemetry.',
    title:
      'Racing Without a Map: Bearings-Only Guidance and Optical Looming for Autonomous Drone Racing',
    metaTitle: 'Racing Without a Map | CUPI Technical Report',
    description:
      'CUPI’s technical survey of camera-and-IMU drone racing, bearings-only guidance, optical looming, control-rate limits, and mapless system design.',
    authors: 'AI-GP Autonomy Team',
    year: 2026,
    publishedAt: '2026-08-16T18:27:42-04:00',
    modifiedAt: '2026-08-16T18:27:42-04:00',
    lastModified: '2026-08-16',
    lastModifiedLabel: 'August 16, 2026',
    pageCount: 16,
    image: '/img/Reports/racing-without-a-map-cover-720.webp',
    imageWidth: 720,
    imageHeight: 932,
  },
];

export const REPORT_METADATA_BY_PAGE = Object.fromEntries(
  REPORT_METADATA.map((report) => [report.pageKey, report]),
);
