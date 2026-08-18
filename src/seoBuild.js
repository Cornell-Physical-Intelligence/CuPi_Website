import {
  ORGANIZATION_DESCRIPTION,
  PAGE_SEO as RUNTIME_PAGE_SEO,
} from './seo.js';
import { REPORT_BY_PAGE } from './data/reportContent.js';
import { SUBTEAMS } from './data/subteams.js';
import { WORK_AREAS, normalizedWorkSummary } from './data/workAreas.js';

// Search engines receive these richer fallback documents from the build. Keeping their
// prose out of the runtime SEO map prevents fallback-only content from joining every
// visitor's initial module graph while preserving one source for shared page metadata.
const BUILD_ENRICHMENT = {
  home: {
    fallbackIntro: ORGANIZATION_DESCRIPTION,
    highlights: [
      'Intelligent robotic manipulation',
      'Autonomous perception and navigation',
      'Multidisciplinary mechanical, electrical, and software engineering',
    ],
    relatedPages: ['vq1Report', 'racingReport'],
    relatedHeading: 'Latest technical reports',
    fallbackSections: [
      {
        heading: 'About Cornell Physical Intelligence',
        paragraphs: [
          'Cornell Physical Intelligence (CUPI), listed by Cornell as the Cornell Physical Intelligence Club, is a Cornell University student robotics organization. We create physical systems that can intelligently reason and interact with their environments. The gap between AI software and hardware needs to be closed seamlessly, and through our multidisciplinary team, we pursue this symbiosis. We prioritize creative, ambitious, and self-starting thinkers, because the problems worth solving here do not come with instructions.',
        ],
      },
      {
        heading: 'CUPI Subteams',
        paragraphs: [],
        bullets: SUBTEAMS.map((team) => `${team.title}: ${team.description}`),
      },
    ],
  },
  work: {
    highlights: [
      'Robotic manipulation with vision-language-action policies',
      'Autonomous drone perception and navigation',
      'CUPI technical reports and project results',
    ],
    fallbackSections: WORK_AREAS.map((area) => ({
      heading: area.title,
      paragraphs: [normalizedWorkSummary(area)],
    })),
  },
  members: {
    highlights: [
      'Mechanical, electrical, software, and business teams',
      'Cornell student researchers and builders',
      'Cornell faculty supporting CUPI robotics work',
    ],
  },
  sponsors: {
    highlights: [
      'Support student-led robotics at Cornell',
      'Help fund robots, sensors, and computing',
      'Read the CUPI sponsorship packet',
    ],
    fallbackSections: [
      {
        heading: 'Current CUPI sponsors',
        paragraphs: [
          'Cornell Physical Intelligence is supported by CU GeoData, Modovolo, Tantalus, and UPS.',
        ],
      },
      {
        heading: 'Sponsor CUPI robotics',
        paragraphs: [
          'Sponsorship helps fund the robots and computing used by Cornell Physical Intelligence. Prospective sponsors can read the CUPI sponsorship packet and contact the team at ab3233@cornell.edu.',
        ],
      },
    ],
  },
  apply: {
    highlights: [
      'Current CUPI applications are closed',
      'Contact the team about future recruitment',
      'Explore CUPI robotics projects and technical reports',
    ],
    fallbackSections: [
      {
        heading: 'Current application status',
        paragraphs: [
          'Applications are currently closed. For questions about future recruitment, contact ab3233@cornell.edu.',
        ],
      },
    ],
  },
  vq1Report: {
    highlights: REPORT_BY_PAGE.vq1Report.highlights,
    sections: REPORT_BY_PAGE.vq1Report.sections,
  },
  racingReport: {
    highlights: REPORT_BY_PAGE.racingReport.highlights,
    sections: REPORT_BY_PAGE.racingReport.sections,
  },
  notFound: {
    highlights: [],
  },
};

export const PAGE_SEO = Object.fromEntries(
  Object.entries(RUNTIME_PAGE_SEO).map(([page, seo]) => [
    page,
    { ...seo, ...BUILD_ENRICHMENT[page] },
  ]),
);

export const getPageSeo = (page) => PAGE_SEO[page] ?? PAGE_SEO.home;

export {
  HOME_LAST_MODIFIED,
  ORGANIZATION_DESCRIPTION,
  SITE_ACRONYM,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_RELEASE_DATE,
  SITE_URL,
  canonicalUrlForPage,
  structuredDataForPage,
} from './seo.js';
