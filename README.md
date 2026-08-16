# Cornell Physical Intelligence (CUPI)

This repository contains the official website for [Cornell Physical Intelligence
(CUPI)](https://cornellphysicalintelligence.com/), a registered student organization at
Cornell University building robotic systems for manipulation, autonomous perception, and
navigation.

CUPI brings together mechanical, electrical, software, and business students to build
intelligent physical systems. The site documents the team, robotics projects, technical
reports, sponsors, and application information.

## Development

```bash
npm ci
npm run dev
```

Run `npm run build` to create the production site in `docs/`. GitHub Pages serves that
folder from the `main` branch at the canonical domain above.

Useful checks:

```bash
npx eslint src vite.config.js
npm run build
```
