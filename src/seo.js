export const SITE_URL = 'https://cornellphysicalintelligence.com';
export const SITE_NAME = 'Cornell Physical Intelligence';
export const SITE_ACRONYM = 'CUPI';

export const ORGANIZATION_DESCRIPTION =
  'Cornell Physical Intelligence (CUPI) is a registered student organization at Cornell University building robotic systems for manipulation, autonomous perception, and navigation.';

export const PAGE_SEO = {
  home: {
    path: '/',
    navLabel: 'Home',
    title: 'Cornell Physical Intelligence (CUPI) | Cornell University',
    heading: 'Cornell Physical Intelligence (CUPI)',
    description: ORGANIZATION_DESCRIPTION,
    highlights: [
      'Intelligent robotic manipulation',
      'Autonomous perception and navigation',
      'Multidisciplinary mechanical, electrical, and software engineering',
    ],
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
  },
  members: {
    path: '/members/',
    navLabel: 'Members',
    title: 'CUPI Team | Cornell Physical Intelligence',
    heading: 'Cornell Physical Intelligence Members',
    description:
      'Meet the Cornell students and faculty advisors behind Cornell Physical Intelligence (CUPI) and its multidisciplinary robotics teams.',
    highlights: [
      'Mechanical, electrical, software, and business teams',
      'Cornell student researchers and builders',
      'Faculty advisors supporting CUPI robotics work',
    ],
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
  },
  apply: {
    path: '/apply/',
    navLabel: 'Apply',
    title: 'Join CUPI | Cornell Physical Intelligence',
    heading: 'Join Cornell Physical Intelligence',
    description:
      'Learn how to join Cornell Physical Intelligence (CUPI), Cornell University’s multidisciplinary student robotics organization.',
    highlights: [
      'Build intelligent physical systems',
      'Work across robotics, hardware, and AI',
      'Check current CUPI application availability',
    ],
  },
  notFound: {
    path: '/404.html',
    navLabel: 'Not found',
    title: 'Page Not Found | Cornell Physical Intelligence',
    heading: 'Page not found',
    description: 'The requested Cornell Physical Intelligence page could not be found.',
    highlights: [],
    noindex: true,
  },
};

export const getPageSeo = (page) => PAGE_SEO[page] ?? PAGE_SEO.home;

export const canonicalUrlForPage = (page) => `${SITE_URL}${getPageSeo(page).path}`;

const organizationNode = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: SITE_ACRONYM,
  url: `${SITE_URL}/`,
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
  alternateName: SITE_ACRONYM,
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

  const graph = page === 'home' ? [organizationNode, websiteNode, webPage] : [webPage];

  if (page !== 'home') {
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
          name: seo.navLabel,
          item: url,
        },
      ],
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

  document.title = seo.title;
  setContent('meta[name="description"]', seo.description);
  setContent('meta[property="og:title"]', seo.title);
  setContent('meta[property="og:description"]', seo.description);
  setContent('meta[property="og:url"]', url);
  setContent('meta[name="twitter:title"]', seo.title);
  setContent('meta[name="twitter:description"]', seo.description);
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
