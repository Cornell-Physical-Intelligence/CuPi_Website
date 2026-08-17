import { REPORT_BY_PAGE } from './data/reportContent.js';
import { SUBTEAMS } from './data/subteams.js';
import { WORK_AREAS, normalizedWorkSummary } from './data/workAreas.js';

export const SITE_URL = 'https://cornellphysicalintelligence.com';
export const SITE_NAME = 'Cornell Physical Intelligence';
export const SITE_ACRONYM = 'CUPI';
export const SITE_RELEASE_DATE = '2026-08-16';
export const HOME_LAST_MODIFIED = '2026-08-17';
export const SITE_ALTERNATE_NAMES = [
  SITE_ACRONYM,
  'Cornell University Physical Intelligence',
  'Cornell Physical Intelligence Club',
];

export const ORGANIZATION_DESCRIPTION =
  'Cornell Physical Intelligence (CUPI) is a Cornell University student robotics organization building systems for manipulation, autonomous perception, and navigation.';

export const PAGE_SEO = {
  home: {
    path: '/',
    navLabel: 'Home',
    title: 'CUPI | Cornell Physical Intelligence at Cornell University',
    heading: 'Cornell Physical Intelligence (CUPI)',
    description:
      'CUPI (Cornell Physical Intelligence) is a Cornell University student robotics organization building systems for manipulation, autonomous perception, and navigation.',
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
    lastModified: HOME_LAST_MODIFIED,
  },
  work: {
    path: '/work/',
    navLabel: 'Work',
    title: 'Robotics Projects & Reports | Cornell Physical Intelligence',
    heading: 'Robotics Projects and Technical Reports',
    description:
      'Explore Cornell Physical Intelligence (CUPI) robotics projects in manipulation, autonomous perception, navigation, and the Anduril AI Grand Prix.',
    highlights: [
      'Robotic manipulation with vision-language-action policies',
      'Autonomous drone perception and navigation',
      'CUPI technical reports and project results',
    ],
    fallbackSections: WORK_AREAS.map((area) => ({
      heading: area.title,
      paragraphs: [normalizedWorkSummary(area)],
    })),
    lastModified: SITE_RELEASE_DATE,
  },
  members: {
    path: '/members/',
    navLabel: 'Members',
    title: 'CUPI Team | Cornell Physical Intelligence',
    heading: 'Cornell Physical Intelligence Members',
    description:
      'Meet the Cornell students and faculty behind Cornell Physical Intelligence (CUPI) and its multidisciplinary robotics teams.',
    highlights: [
      'Mechanical, electrical, software, and business teams',
      'Cornell student researchers and builders',
      'Cornell faculty supporting CUPI robotics work',
    ],
    lastModified: SITE_RELEASE_DATE,
  },
  sponsors: {
    path: '/sponsors/',
    navLabel: 'Sponsors',
    title: 'Sponsors | Cornell Physical Intelligence (CUPI)',
    heading: 'Sponsor Cornell Physical Intelligence',
    description:
      'Meet the organizations supporting Cornell Physical Intelligence (CUPI) and learn how to sponsor student robotics research at Cornell University.',
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
    lastModified: SITE_RELEASE_DATE,
  },
  apply: {
    path: '/apply/',
    navLabel: 'Apply',
    title: 'CUPI Applications | Cornell Physical Intelligence',
    heading: 'Cornell Physical Intelligence Applications',
    description:
      'Check the current application status for Cornell Physical Intelligence (CUPI) and contact the team about future Cornell robotics opportunities.',
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
    lastModified: SITE_RELEASE_DATE,
  },
  vq1Report: {
    path: REPORT_BY_PAGE.vq1Report.path,
    navLabel: REPORT_BY_PAGE.vq1Report.cardTitle,
    title: REPORT_BY_PAGE.vq1Report.metaTitle,
    heading: REPORT_BY_PAGE.vq1Report.title,
    description: REPORT_BY_PAGE.vq1Report.description,
    highlights: REPORT_BY_PAGE.vq1Report.highlights,
    sections: REPORT_BY_PAGE.vq1Report.sections,
    image: REPORT_BY_PAGE.vq1Report.image,
    report: REPORT_BY_PAGE.vq1Report,
    parentPage: 'work',
    lastModified: REPORT_BY_PAGE.vq1Report.lastModified,
  },
  racingReport: {
    path: REPORT_BY_PAGE.racingReport.path,
    navLabel: REPORT_BY_PAGE.racingReport.cardTitle,
    title: REPORT_BY_PAGE.racingReport.metaTitle,
    heading: REPORT_BY_PAGE.racingReport.title,
    description: REPORT_BY_PAGE.racingReport.description,
    highlights: REPORT_BY_PAGE.racingReport.highlights,
    sections: REPORT_BY_PAGE.racingReport.sections,
    image: REPORT_BY_PAGE.racingReport.image,
    report: REPORT_BY_PAGE.racingReport,
    parentPage: 'work',
    lastModified: REPORT_BY_PAGE.racingReport.lastModified,
  },
  notFound: {
    path: '/404.html',
    navLabel: 'Not found',
    title: 'Page Not Found | Cornell Physical Intelligence',
    heading: 'Page not found',
    description: 'The requested Cornell Physical Intelligence page could not be found.',
    highlights: [],
    noindex: true,
    lastModified: SITE_RELEASE_DATE,
  },
};

export const getPageSeo = (page) => PAGE_SEO[page] ?? PAGE_SEO.home;

export const canonicalUrlForPage = (page) => `${SITE_URL}${getPageSeo(page).path}`;

const organizationNode = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAMES,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon-192.png`,
  email: 'cuphysint@cornell.edu',
  description: ORGANIZATION_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ithaca',
    addressRegion: 'NY',
    postalCode: '14853',
    addressCountry: 'US',
  },
  sameAs: [
    'https://cornell.campusgroups.com/cupi/home/',
    'https://github.com/Cornell-Physical-Intelligence',
    'https://www.instagram.com/cornellphysicalintelligence/',
    'https://www.linkedin.com/company/cu-physical-intelligence/',
  ],
};

const websiteNode = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAMES,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-US',
};

export const structuredDataForPage = (page) => {
  const seo = getPageSeo(page);
  if (seo.noindex) return null;

  const url = canonicalUrlForPage(page);
  const webPage = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: seo.heading,
    description: seo.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-US',
  };

  if (seo.report) {
    webPage.mainEntity = { '@id': `${url}#report` };
    webPage.dateModified = seo.lastModified;
  }

  const graph = page === 'home' ? [organizationNode, websiteNode, webPage] : [webPage];

  if (page !== 'home') {
    const parent = seo.parentPage ? getPageSeo(seo.parentPage) : null;
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: parent?.navLabel ?? seo.navLabel,
          item: parent ? canonicalUrlForPage(seo.parentPage) : url,
        },
        ...(parent
          ? [{ '@type': 'ListItem', position: 3, name: seo.navLabel, item: url }]
          : []),
      ],
    });
  }

  if (seo.report) {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${url}#report`,
      url,
      headline: seo.heading,
      description: seo.description,
      image: `${SITE_URL}${seo.image}`,
      author: {
        '@type': 'Organization',
        name: seo.report.authors,
        parentOrganization: { '@id': `${SITE_URL}/#organization` },
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/favicon-192.png`,
      },
      dateModified: seo.lastModified,
      inLanguage: 'en-US',
      encoding: {
        '@type': 'MediaObject',
        contentUrl: `${SITE_URL}/docs/${seo.report.slug}.pdf`,
        encodingFormat: 'application/pdf',
      },
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
};

// Static route documents carry the correct head before JavaScript runs. When a visitor
// moves between them without a reload, keep that same information aligned with the URL.
export const applyPageSeo = (page) => {
  if (typeof document === 'undefined') return;

  const seo = getPageSeo(page);
  const url = canonicalUrlForPage(page);
  const setContent = (selector, content) => {
    document.querySelector(selector)?.setAttribute('content', content);
  };
  const upsertMeta = (attribute, key, content) => {
    let meta = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!content) {
      meta?.remove();
      return;
    }
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  document.title = seo.title;
  setContent('meta[name="description"]', seo.description);
  setContent('meta[property="og:title"]', seo.title);
  setContent('meta[property="og:description"]', seo.description);
  setContent('meta[property="og:url"]', url);
  setContent('meta[name="twitter:title"]', seo.title);
  setContent('meta[name="twitter:description"]', seo.description);
  setContent('meta[name="twitter:card"]', seo.image ? 'summary_large_image' : 'summary');
  upsertMeta('property', 'og:image', seo.image ? `${SITE_URL}${seo.image}` : null);
  upsertMeta('property', 'og:image:alt', seo.image ? `Cover of ${seo.heading}` : null);
  upsertMeta('name', 'twitter:image', seo.image ? `${SITE_URL}${seo.image}` : null);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);

  const data = structuredDataForPage(page);
  let script = document.querySelector('#seo-structured-data');
  if (!data) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = 'seo-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data).replaceAll('<', '\\u003c');
};
