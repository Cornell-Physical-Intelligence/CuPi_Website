import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const OUT_DIR = 'docs'

// Routes the app answers to. Home is the root index and needs no folder of its own.
const ROUTES = ['work', 'members', 'sponsors', 'apply']

// GitHub Pages serves static files, so /work only resolves if a document actually lives
// there. Copying the built index.html into a folder per route makes each URL a real page
// that boots the app, which the router then reads back from the pathname. Doing it this
// way rather than with a 404 redirect means no flash of a wrong page on a deep link.
// The 404 copy is a safety net for anything not in the list.
const emitRoutePages = () => ({
  name: 'emit-route-pages',
  closeBundle() {
    const html = readFileSync(join(OUT_DIR, 'index.html'))
    for (const route of ROUTES) {
      mkdirSync(join(OUT_DIR, route), { recursive: true })
      writeFileSync(join(OUT_DIR, route, 'index.html'), html)
    }
    writeFileSync(join(OUT_DIR, '404.html'), html)
  },
})

// Pages for this repo serves the `main` branch's /docs folder, so the production build is
// written there and committed. base stays '/' because the site is served from a custom
// domain at the root, not from a project subpath.
export default defineConfig({
  base: '/',
  plugins: [react(), emitRoutePages()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
  },
})
