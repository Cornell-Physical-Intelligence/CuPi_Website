import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGE_SEO, SITE_URL, canonicalUrlForPage } from '../src/seo.js';

const INDEXABLE_PAGES = Object.entries(PAGE_SEO).filter(([, seo]) => !seo.noindex);

const fileForPage = (seo) =>
  seo.path === '/'
    ? 'docs/index.html'
    : join('docs', seo.path.replace(/^\/+|\/+$/g, ''), 'index.html');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const capture = (html, pattern, label) => {
  const value = html.match(pattern)?.[1];
  assert(value, `Missing ${label}`);
  return value;
};

const count = (html, pattern) => (html.match(pattern) ?? []).length;

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

for (const [page, seo] of INDEXABLE_PAGES) {
  const file = fileForPage(seo);
  assert(existsSync(file), `${page} static document is missing at ${file}`);

  const html = readFileSync(file, 'utf8');
  assert(count(html, /<title>/g) === 1, `${page} must have exactly one title`);
  assert(
    count(html, /<meta name="description"/g) === 1,
    `${page} must have exactly one description`,
  );
  assert(
    count(html, /<meta name="robots"/g) === 1,
    `${page} must have exactly one robots directive`,
  );
  assert(
    count(html, /<link rel="canonical"/g) === 1,
    `${page} must have exactly one canonical`,
  );
  assert(count(html, /<h1>/g) === 1, `${page} static fallback must have one H1`);
  assert(
    count(html, /id="seo-structured-data"/g) === 1,
    `${page} must have exactly one structured-data graph`,
  );

  const title = capture(html, /<title>(.*?)<\/title>/, `${page} title`);
  const description = capture(
    html,
    /<meta name="description" content="(.*?)"/,
    `${page} description`,
  );
  const canonical = capture(
    html,
    /<link rel="canonical" href="(.*?)"/,
    `${page} canonical`,
  );
  const heading = capture(html, /<h1>(.*?)<\/h1>/, `${page} static H1`);
  const json = capture(
    html,
    /<script id="seo-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/,
    `${page} structured data`,
  );

  assert(title === escapeHtml(seo.title), `${page} title does not match the SEO map`);
  assert(description === escapeHtml(seo.description), `${page} description is incorrect`);
  assert(description.length >= 100, `${page} description is too short`);
  assert(canonical === canonicalUrlForPage(page), `${page} canonical is incorrect`);
  assert(heading === escapeHtml(seo.heading), `${page} static H1 does not match the SEO map`);
  assert(html.includes('name="robots" content="index, follow'), `${page} is not indexable`);
  assert(html.includes('href="/work/"'), `${page} is missing crawlable primary links`);

  const data = JSON.parse(json);
  assert(Array.isArray(data['@graph']) && data['@graph'].length > 0, `${page} schema is empty`);
  const webPage = data['@graph'].find((node) => node['@type'] === 'WebPage');
  assert(webPage?.url === canonical, `${page} WebPage schema URL is incorrect`);
  assert(webPage?.['@id'] === `${canonical}#webpage`, `${page} WebPage schema ID is incorrect`);

  if (page !== 'home') {
    const routeChunkName = `${page[0].toUpperCase()}${page.slice(1)}`;
    assert(
      new RegExp(`rel="modulepreload"[^>]+/assets/${routeChunkName}-[^"/]+\\.js`).test(html),
      `${page} is missing its route module preload`,
    );
  }

  if (page === 'home') {
    const organization = data['@graph'].find((node) => node['@type'] === 'Organization');
    assert(organization, 'Homepage schema is missing the organization');
    for (const alternate of [
      'CUPI',
      'Cornell Physical Intelligence Club',
    ]) {
      assert(
        organization.alternateName?.includes(alternate),
        `Organization schema is missing alternate name: ${alternate}`,
      );
    }
    assert(
      organization.sameAs?.includes('https://cornell.campusgroups.com/cupi/home/'),
      'Organization schema must reference the official Cornell listing',
    );
    assert(organization.logo === `${SITE_URL}/favicon-192.png`, 'Organization logo is incorrect');
    assert(organization.email === 'cuphysint@cornell.edu', 'Organization email is incorrect');
    assert(
      html.includes('mailto:cuphysint@cornell.edu'),
      'The structured organization email must also be visible to readers',
    );
    assert(html.includes('Ithaca, New York'), 'The structured organization location must be visible');
  }

  if (seo.report) {
    const article = data['@graph'].find((node) => node['@type'] === 'TechArticle');
    assert(article?.headline === seo.heading, `${page} report schema headline is incorrect`);
    assert(
      article?.publisher?.['@id'] === `${SITE_URL}/#organization` &&
        article.publisher.name === 'Cornell Physical Intelligence' &&
        article.publisher.logo === `${SITE_URL}/favicon-192.png`,
      `${page} report schema publisher is incomplete`,
    );
    assert(
      article?.encoding?.contentUrl === `${SITE_URL}/docs/${seo.report.slug}.pdf`,
      `${page} report schema PDF is incorrect`,
    );
    assert(
      html.includes(`href="/docs/${seo.report.slug}.pdf"`),
      `${page} static HTML must link to its PDF`,
    );
    assert(
      html.includes(`<time datetime="${seo.lastModified}">${seo.report.lastModifiedLabel}</time>`),
      `${page} static HTML must expose its schema modification date`,
    );
    for (const section of seo.sections) {
      assert(
        html.includes(`<h2>${escapeHtml(section.heading)}</h2>`),
        `${page} static HTML is missing section: ${section.heading}`,
      );
    }
    const imagePath = join('docs', seo.image.replace(/^\/+/, ''));
    assert(existsSync(imagePath), `${page} social image is missing: ${imagePath}`);
    assert(
      html.includes(`<meta property="og:image" content="${SITE_URL}${seo.image}"`),
      `${page} is missing its Open Graph image`,
    );
  }

  for (const section of seo.fallbackSections ?? []) {
    assert(
      html.includes(`<h2>${escapeHtml(section.heading)}</h2>`),
      `${page} static HTML is missing fallback section: ${section.heading}`,
    );
    for (const paragraph of section.paragraphs) {
      assert(
        html.includes(`<p>${escapeHtml(paragraph)}</p>`),
        `${page} static HTML is missing fallback copy for: ${section.heading}`,
      );
    }
    for (const item of section.bullets ?? []) {
      assert(
        html.includes(`<li>${escapeHtml(item)}</li>`),
        `${page} static HTML is missing fallback list content for: ${section.heading}`,
      );
    }
  }
}

const workHtml = readFileSync(fileForPage(PAGE_SEO.work), 'utf8');
for (const [page, seo] of INDEXABLE_PAGES.filter(([, entry]) => entry.parentPage === 'work')) {
  assert(
    workHtml.includes(`href="${seo.path}"`),
    `Work static HTML must link to child route: ${page}`,
  );
}

const notFound = readFileSync('docs/404.html', 'utf8');
assert(notFound.includes('name="robots" content="noindex, follow"'), '404 must be noindex');
assert(!notFound.includes('type="module"'), '404 must not boot the homepage SPA');
assert(!notFound.includes('modulepreload'), '404 must not preload application modules');
assert(!notFound.includes('rel="stylesheet"'), '404 must not load application stylesheets');

const robots = readFileSync('docs/robots.txt', 'utf8');
assert(robots.includes('Allow: /'), 'robots.txt must allow crawling');
assert(
  robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
  'robots.txt must advertise the canonical sitemap',
);

const sitemap = readFileSync('docs/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = INDEXABLE_PAGES.map(([page]) => canonicalUrlForPage(page));
assert(
  JSON.stringify(sitemapUrls) === JSON.stringify(expectedUrls),
  'Sitemap URL inventory or ordering does not match PAGE_SEO',
);
for (const [page, seo] of INDEXABLE_PAGES) {
  const entry = `<loc>${canonicalUrlForPage(page)}</loc>\n    <lastmod>${seo.lastModified}</lastmod>`;
  assert(sitemap.includes(entry), `Sitemap lastmod is missing or inaccurate for ${page}`);
}
assert(
  readFileSync('public/sitemap.xml', 'utf8') === sitemap,
  'The development and production sitemaps must be identical',
);

console.log(`SEO verification passed for ${INDEXABLE_PAGES.length} production routes.`);
