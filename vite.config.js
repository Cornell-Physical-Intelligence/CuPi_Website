import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages for this repo serves the `main` branch's /docs folder, so the production
// build is written there and committed. base stays '/' because the site is served from a
// custom domain at the root, not from a project subpath.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
