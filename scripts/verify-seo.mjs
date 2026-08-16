import { readFileSync } from 'node:fs';
import { PAGE_SEO, canonicalUrlForPage } from '../src/seo.js';

const ROUTE_FILES = {
  home: 'docs/index.html',
  work: 'docs/work/index.html',
  members: 'docs/members/index.html',
  sponsors: 'docs/sponsors/index.html',
  apply: 'docs/apply/index.html',
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const capture = (html, pattern, label) => {
  const value = html.match(pattern)?.[1];
  assert(value, `Missing ${label}`);
  return value;
};

for (const [page, file] of Object.entries(ROUTE_FILES)) {
  const html = readFileSync(file, 'utf8');
  const seo = PAGE_SEO[page];
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

  assert(title.length >= 25, `${page} title is too vague: ${title}`);
  assert(description.length >= 100, `${page} description is too short`);
  assert(canonical === canonicalUrlForPage(page), `${page} canonical is incorrect`);
  assert(heading.includes(seo.heading), `${page} static H1 does not match the SEO map`);
  assert(html.includes('name="robots" content="index, follow'), `${page} is not indexable`);
  assert(html.includes('href="/work/"'), `${page} is missing crawlable route links`);

  const data = JSON.parse(json);
  assert(Array.isArray(data['@graph']) && data['@graph'].length > 0, `${page} schema is empty`);
}

const notFound = readFileSync('docs/404.html', 'utf8');
assert(notFound.includes('name="robots" content="noindex, follow"'), '404 must be noindex');
assert(!notFound.includes('type="module"'), '404 must not boot the homepage SPA');

const robots = readFileSync('docs/robots.txt', 'utf8');
assert(robots.includes('Allow: /'), 'robots.txt must allow crawling');
assert(
  robots.includes('Sitemap: https://cornellphysicalintelligence.com/sitemap.xml'),
  'robots.txt must advertise the canonical sitemap',
);

const sitemap = readFileSync('docs/sitemap.xml', 'utf8');
for (const page of Object.keys(ROUTE_FILES)) {
  const url = canonicalUrlForPage(page);
  assert(sitemap.includes(`<loc>${url}</loc>`), `Sitemap is missing ${url}`);
}

console.log('SEO verification passed for all production routes.');
