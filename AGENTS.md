# Agent notes for the CUPI website

Read this before changing code. These are the decisions that keep getting
re-litigated; they are settled.

## Do not rewrite finished pages

- **Apply page**: two finished variants behind one switch. `APPLY_ACTIVE` in
  `src/pages/Apply.jsx` picks `ApplyOpen.jsx` (interest form, recruiting
  season) or `ApplyClosed.jsx` (crab + closed note, off season). Flip the
  flag; never rewrite, restyle, or "improve" either variant unprompted. The
  README section "Apply page: open vs closed" covers the seo.js and sitemap
  steps that go with a flip.
- The interest form's backend is the self-contained `lib/interest.js`
  component in the wiki repo (`Cornell-Physical-Intelligence/wiki`), mounted
  at `/api/interest*`. Keep it a component: its own tables and routes, one
  mount point, nothing in the wiki's core state. Never replace it with a
  third-party form service.

## Gates that must stay green

- `npm run check` before any commit: lint, build, asset/font/SEO verification.
- The committed `docs/` build must equal a fresh rebuild (CI diffs it), and
  `public/sitemap.xml` must equal the generated `docs/sitemap.xml`. Changing
  any `lastModified` in `src/seo.js` means rebuilding and re-syncing both.
- `lastModified` dates record real content changes only; never bump them to
  simulate freshness.

## Conventions

- No em dashes in site copy; write around them.
- Visible presentation changes need Andre's approval first; preview before
  shipping. Nonvisual SEO/perf changes still go through the full gate.
- Favicons: the fetchable icon URLs stay the circular disc (Google's pick);
  the rounded-square tab icon ships only as an inline data URI. Keep that
  pairing exactly.
- SEO copy lives in `src/seo.js` and the document head, not in visible page
  prose. Do not add crawl-oriented text blocks to pages.
- The hero, gallery, and report pipelines were performance-tuned with
  pixel-parity gates (see git history around 2026-08-19). Do not regress
  transfer size or main-thread work for cosmetic refactors.
