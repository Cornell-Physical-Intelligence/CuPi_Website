import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pages for this repo serves the `main` branch's /docs folder, so this is where the
// production build lands. It is read back from the resolved config rather than assumed,
// so `vite build --outDir somewhere/else` still emits its route pages into the right
// place — which is what makes it possible to build a copy for measurement without
// touching the committed one.
const DEFAULT_OUT_DIR = 'docs'

// Routes the app answers to. Home is the root index and needs no folder of its own.
const ROUTES = ['work', 'members', 'sponsors', 'apply']

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
        const match = chunk.facadeModuleId.match(/src\/pages\/([A-Za-z]+)\.jsx$/)
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
        const entry = chunks[route]
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
        const html = lines ? base.replace(CLOSING_HEAD, `${lines}$1</head>`) : base
        return PLAYFAIR_ROUTES.has(route) ? html : html.replace(PLAYFAIR_PRELOAD, '')
      }

      writeFileSync(join(outDir, 'index.html'), withHints('home'))
      for (const route of ROUTES) {
        mkdirSync(join(outDir, route), { recursive: true })
        writeFileSync(join(outDir, route, 'index.html'), withHints(route))
      }
      // The 404 fallback can be reached as any URL, so it preloads nothing in particular.
      writeFileSync(join(outDir, '404.html'), base)
    },
  }
}

// Pages for this repo serves the `main` branch's /docs folder, so the production build is
// written there and committed. base stays '/' because the site is served from a custom
// domain at the root, not from a project subpath.
export default defineConfig({
  base: '/',
  plugins: [react(), emitRoutePages()],
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
