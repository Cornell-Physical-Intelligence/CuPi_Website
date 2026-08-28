# Asset masters

These are the full-resolution source files used by `npm run assets`. They live outside
`public/` on purpose: Vite copies everything under `public/` into the deployed site, while
visitors only need the smaller AVIF, WebP, and 960px video derivatives generated from
these files.

Keep masters here when replacing gallery art, report renders, video clips or their poster
frames. Commit the generated files under `public/` alongside the source change.

`og-card.html` is the source of `public/og-cupi.png`, the link preview every page shares.
It is self-contained: open it in a browser at exactly 1200x630 and screenshot, then save
as a 256-colour PNG. Editing the card means re-exporting that file.

`legacy/` preserves retired site media at its former `public/`-relative path. Nothing in
that directory is a build input or a deployable asset. When intentionally adding or
removing a legacy file, update the explicit allowlist in
`scripts/verify-production-assets.mjs`; the verifier prevents every listed file from
reappearing under either `public/` or `docs/`.
