# Cornell Physical Intelligence (CUPI)

This repository contains the official website for [Cornell Physical Intelligence
(CUPI)](https://cornellphysicalintelligence.com/), a Cornell University student robotics
organization building systems for manipulation, autonomous perception, and navigation.
Cornell lists the organization as the [Cornell Physical Intelligence
Club](https://cornell.campusgroups.com/cupi/home/).

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
npm run check
```

`npm run check` is the full gate: lint, build, and the asset, font, and SEO
verifications. CI runs it on every push and also requires the committed `docs/`
build to match a fresh rebuild, so commit the rebuilt `docs/` with any source
change.

## Apply page: open vs closed

The Apply page has two finished variants and one switch:

- `src/pages/Apply.jsx` holds `APPLY_ACTIVE`, the only line to change.
- `true` renders `ApplyOpen.jsx`: the interest form. Submissions post to the
  wiki backend (`wiki.cornellphysicalintelligence.com/api/interest`, the
  `lib/interest.js` component in the wiki repo) and appear on the wiki's
  admin-only `#/interest` screen with CSV export.
- `false` renders `ApplyClosed.jsx`: the original crab page with the
  "applications are closed" note.

When flipping the switch, do not rewrite either variant. Update the `apply`
entry's `description` and `lastModified` in `src/seo.js` if the wording no
longer matches, rebuild, and copy `docs/sitemap.xml` over `public/sitemap.xml`
(the SEO check requires them identical). If the closed page ever becomes the
live variant again, its crab is the route's largest contentful paint once
more; the image preload that used to live in `vite.config.js` (see git
history) is worth restoring then.
