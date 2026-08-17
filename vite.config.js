import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {
  PAGE_SEO,
  SITE_ACRONYM,
  SITE_NAME,
  SITE_URL,
  canonicalUrlForPage,
  getPageSeo,
  structuredDataForPage,
} from './src/seo.js'

// Pages for this repo serves the `main` branch's /docs folder, so this is where the
// production build lands. It is read back from the resolved config rather than assumed,
// so `vite build --outDir somewhere/else` still emits its route pages into the right
// place — which is what makes it possible to build a copy for measurement without
// touching the committed one.
const DEFAULT_OUT_DIR = 'docs'

// Routes the app answers to. Home is the root index and needs no folder of its own.
const ROUTES = Object.entries(PAGE_SEO)
  .filter(([page, seo]) => page !== 'home' && !seo.noindex)
  .map(([page]) => page)

// GitHub Pages serves static files, so /work only resolves if a document actually lives
// there. Copying the built index.html into a folder per route makes each URL a real page
// that boots the app, which the router then reads back from the pathname. Doing it this
// way rather than with a 404 redirect means no flash of a wrong page on a deep link.
// The 404 copy is a safety net for anything not in the list.
//
// Each copy also declares the one route chunk that document is going to need. Every page
// is code-split, and without this a visitor opening /members waits out two round trips in
// series: fetch the entry chunk, run it, discover the dynamic import, fetch that. The
// browser cannot see past the first one on its own, because the second URL only exists
// inside the first file. Naming it in the HTML collapses the two into one — which is the
// whole point, since splitting is only free if the split half is not also serialised.

// Playfair is rasterised by the Voronoi hero and drawn into the sponsor lockups, and it is
// used nowhere else — no body copy, no headings, no nav. Preloading it from the shared
// <head> therefore pulled 23KB on /work, /members and /apply that those pages have no glyph
// to spend it on, which on /apply was a seventh of the entire page. The @font-face stays
// declared everywhere, so a visitor who navigates to the hero still gets the face; what is
// route-specific is only whether the fetch is forced up front.
const PLAYFAIR_ROUTES = new Set(['home', 'sponsors'])
const PLAYFAIR_PRELOAD = /\n\s*<link\b[^>]*playfair-display[^>]*>/i

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const seoHead = (page) => {
  const seo = getPageSeo(page)
  const url = canonicalUrlForPage(page)
  const robots = seo.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  const structuredData = structuredDataForPage(page)
  const jsonLd = structuredData
    ? `\n    <script id="seo-structured-data" type="application/ld+json">${JSON.stringify(
        structuredData,
        null,
        2,
      ).replaceAll('<', '\\u003c')}</script>`
    : ''
  const socialImage = seo.image
    ? `
    <meta property="og:image" content="${SITE_URL}${seo.image}" />
    <meta property="og:image:alt" content="Cover of ${escapeHtml(seo.heading)}" />
    <meta name="twitter:image" content="${SITE_URL}${seo.image}" />`
    : ''

  return `<!-- seo:head:start -->
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="application-name" content="${SITE_NAME}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="${seo.image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />${socialImage}${jsonLd}
    <!-- seo:head:end -->`
}

const seoFallback = (page) => {
  const seo = getPageSeo(page)
  const nav = Object.entries(PAGE_SEO)
    .filter(([, entry]) => !entry.noindex && !entry.parentPage)
    .map(
      ([key, entry]) =>
        `<a href="${entry.path}"${key === page ? ' aria-current="page"' : ''}>${escapeHtml(
          entry.navLabel,
        )}</a>`,
    )
    .join('\n          ')
  const highlights = seo.highlights.length
    ? `\n        <ul class="seo-fallback__highlights">\n${seo.highlights
        .map((item) => `          <li>${escapeHtml(item)}</li>`)
        .join('\n')}\n        </ul>`
    : ''
  const contentSections = seo.sections ?? seo.fallbackSections
  const sections = contentSections?.length
    ? `
        <div class="seo-fallback__sections">
${contentSections
  .map(
    (section) => `          <section>
            <h2>${escapeHtml(section.heading)}</h2>
${section.paragraphs.map((paragraph) => `            <p>${escapeHtml(paragraph)}</p>`).join('\n')}
${section.bullets?.length ? `            <ul>\n${section.bullets.map((item) => `              <li>${escapeHtml(item)}</li>`).join('\n')}\n            </ul>` : ''}
          </section>`,
  )
  .join('\n')}
        </div>`
    : ''
  const reportLink = seo.report
    ? `
        <p>CUPI Technical Report · ${escapeHtml(seo.report.year)} · Updated <time datetime="${escapeHtml(
          seo.report.lastModified,
        )}">${escapeHtml(seo.report.lastModifiedLabel)}</time></p>
        <p><a href="/docs/${seo.report.slug}.pdf">Read the full ${escapeHtml(
          seo.report.pageCount,
        )}-page technical report (PDF)</a></p>`
    : ''
  const explicitRelatedLinks = (seo.relatedPages ?? [])
    .map((relatedPage) => PAGE_SEO[relatedPage])
    .filter((entry) => entry && !entry.noindex)
  const childLinks = Object.values(PAGE_SEO).filter(
    (entry) => !entry.noindex && entry.parentPage === page,
  )
  const relatedEntries = explicitRelatedLinks.length ? explicitRelatedLinks : childLinks
  const relatedLinks = relatedEntries.length
    ? `
        <section class="seo-fallback__related" aria-labelledby="seo-related-heading">
          <h2 id="seo-related-heading">${escapeHtml(
            seo.relatedHeading ?? 'CUPI technical reports',
          )}</h2>
          <ul>
${relatedEntries
  .map(
    (entry) =>
      `            <li><a href="${entry.path}">${escapeHtml(
        entry.report ? entry.heading : entry.navLabel,
      )}</a>${
        entry.report?.cardSubtitle ? ` — ${escapeHtml(entry.report.cardSubtitle)}` : ''
      }</li>`,
  )
  .join('\n')}
          </ul>
        </section>`
    : ''

  return `<!-- seo:fallback:start -->
    <div class="seo-fallback">
      <header class="seo-fallback__header">
        <a class="seo-fallback__brand" href="/">${SITE_NAME} (${SITE_ACRONYM})</a>
        <nav class="seo-fallback__nav" aria-label="Primary">
          ${nav}
        </nav>
      </header>
      <main class="seo-fallback__main">
        <p class="seo-fallback__eyebrow">${SITE_ACRONYM} at Cornell University</p>
        <h1>${escapeHtml(seo.heading)}</h1>
        <p class="seo-fallback__intro">${escapeHtml(seo.description)}</p>${highlights}${relatedLinks}${reportLink}${sections}
      </main>
      <footer class="seo-fallback__footer">
        <p>${SITE_NAME} (${SITE_ACRONYM}) is a Cornell University student robotics organization based in Ithaca, New York.</p>
        <p><a href="https://cornell.campusgroups.com/cupi/home/">Official Cornell listing: Cornell Physical Intelligence Club</a></p>
        <p>General inquiries: <a href="mailto:cuphysint@cornell.edu">cuphysint@cornell.edu</a></p>
        <p><span data-nosnippet><a href="https://hr.cornell.edu/about/workplace-rights/equal-education-and-employment">Equal Education &amp; Employment</a></span></p>
      </footer>
    </div>
    <!-- seo:fallback:end -->`
}

const renderSeoDocument = (html, page) =>
  html
    .replace(/<!-- seo:head:start -->[\s\S]*?<!-- seo:head:end -->/, seoHead(page))
    .replace(
      /<!-- seo:fallback:start -->[\s\S]*?<!-- seo:fallback:end -->/,
      seoFallback(page),
    )

const sitemapDocument = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.entries(PAGE_SEO)
  .filter(([, seo]) => !seo.noindex)
  .map(
    ([page, seo]) => `  <url>
    <loc>${canonicalUrlForPage(page)}</loc>
    <lastmod>${seo.lastModified}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const notFoundDocument = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${seoHead('notFound')}
    <style>
      html { color-scheme: light dark; font-family: system-ui, sans-serif; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; text-align: center; }
      main { padding: 32px; }
      h1 { margin: 0 0 12px; font-size: clamp(2rem, 7vw, 5rem); font-weight: 500; }
      p { margin: 0; line-height: 1.6; }
      a { color: inherit; text-underline-offset: 0.2em; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(getPageSeo('notFound').heading)}</h1>
      <p>The requested page could not be found. <a href="/">Return to Cornell Physical Intelligence.</a></p>
    </main>
  </body>
</html>
`

const pageFromDevPath = (path) => {
  const raw = path.replace(/index\.html$/, '') || '/'
  const normalized = raw === '/' || raw.endsWith('/') ? raw : `${raw}/`
  return (
    Object.entries(PAGE_SEO).find(([, seo]) => seo.path === normalized)?.[0] ?? 'home'
  )
}

// The same renderer powers development and the route copies emitted below. This keeps
// the browser's head, the committed static documents, and the client-side SEO map from
// quietly drifting into three versions of the organization name.
const seoDocuments = () => ({
  name: 'seo-documents',
  transformIndexHtml(html, context) {
    return renderSeoDocument(html, pageFromDevPath(context.path))
  },
})

const emitRoutePages = () => {
  // route -> { js, css[] }, filled in while the bundle still exists in memory.
  const chunks = {}
  let outDir = DEFAULT_OUT_DIR

  return {
    name: 'emit-route-pages',

    configResolved(config) {
      outDir = config.build.outDir
    },

    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.facadeModuleId) continue
        const match = chunk.facadeModuleId.match(/src\/pages\/([^/]+)\.jsx$/)
        if (!match) continue
        chunks[match[1].toLowerCase()] = {
          js: chunk.fileName,
          css: [...(chunk.viteMetadata?.importedCss ?? [])],
        }
      }
    },

    closeBundle() {
      const base = readFileSync(join(outDir, 'index.html'), 'utf8')

      // modulepreload for the script (fetch, parse, and hold it ready as a module) and a
      // plain preload for its stylesheet — warming it rather than linking it, because the
      // chunk injects its own <link> when it runs and two live stylesheets for one file is
      // a needless thing to reason about later.
      const hints = (route) => {
        const entry = chunks[route.toLowerCase()]
        if (!entry) return ''
        const lines = [`    <link rel="modulepreload" crossorigin href="/${entry.js}" />`]
        for (const css of entry.css) {
          lines.push(`    <link rel="preload" as="style" href="/${css}" />`)
        }
        return `${lines.join('\n')}\n`
      }

      // Matched with its own indentation and put back with it, so a route that gets no
      // hints comes out byte-identical to the source document rather than quietly
      // re-indented.
      const CLOSING_HEAD = /([ \t]*)<\/head>/

      const withHints = (route) => {
        const lines = hints(route)
        const document = renderSeoDocument(base, route)
        const html = lines ? document.replace(CLOSING_HEAD, `${lines}$1</head>`) : document
        return PLAYFAIR_ROUTES.has(route) ? html : html.replace(PLAYFAIR_PRELOAD, '')
      }

      writeFileSync(join(outDir, 'index.html'), withHints('home'))
      for (const route of ROUTES) {
        const routeDir = getPageSeo(route).path.replace(/^\/+|\/+$/g, '')
        mkdirSync(join(outDir, routeDir), { recursive: true })
        writeFileSync(join(outDir, routeDir, 'index.html'), withHints(route))
      }
      writeFileSync(join(outDir, 'sitemap.xml'), sitemapDocument())
      // A standalone 404 carries no app chunks, stylesheets, or fonts. It cannot replace
      // itself with Home or spend bandwidth on assets that a not-found page never uses.
      writeFileSync(join(outDir, '404.html'), notFoundDocument())
    },
  }
}

// Pages for this repo serves the `main` branch's /docs folder, so the production build is
// written there and committed. base stays '/' because the site is served from a custom
// domain at the root, not from a project subpath.
export default defineConfig({
  base: '/',
  plugins: [react(), seoDocuments(), emitRoutePages()],
  build: {
    outDir: DEFAULT_OUT_DIR,
    emptyOutDir: true,
    // Never base64 an asset into the bundle. The roster imports 272 portrait files (34
    // people x 4 widths x 2 formats) and most are under Vite's 4KB default, so the default
    // inlined them — which costs three ways at once: base64 is a third larger than the
    // bytes it carries, already-compressed image data does not gzip again, and every
    // variant lands in the bundle even though each visitor displays exactly one of the
    // eight. It put 314KB into a JS file that has to parse before anything renders.
    assetsInlineLimit: 0,
  },
})
