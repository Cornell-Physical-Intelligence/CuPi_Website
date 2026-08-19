# Production font subsets

The two WOFF2 files in this folder are the licensed Google Fonts Latin originals. They
are source material only and are never copied into the production site. Their OFL license
texts remain in `public/fonts/`.

The files with the same family names in `public/fonts/` are reviewed production subsets:

- Playfair Display contains the glyphs used by the `CUPI` canvas hero and the generated
  `Tantalus` sponsor lockup.
- Questrial contains printable ASCII plus the punctuation currently used by the site.
  The dev-only sigma and gear already fell through to the system fallback in the original
  Google Fonts Latin file, and retain that behavior.

They were generated with FontTools 4.60.2 and Brotli using:

```sh
python3 -m fontTools.subset font-sources/playfair-display-700-latin-full.woff2 \
  --output-file=public/fonts/playfair-display-700-latin.woff2 \
  --text='CUPITantalus' --flavor=woff2 --layout-features='*' --glyph-names \
  --symbol-cmap --legacy-cmap --notdef-glyph --notdef-outline --recommended-glyphs

python3 -m fontTools.subset font-sources/questrial-400-latin-full.woff2 \
  --output-file=public/fonts/questrial-400-latin.woff2 \
  --unicodes='U+0020-007E,U+00B7,U+00D7,U+2013-2014,U+2018-2019,U+2022,U+2026' \
  --flavor=woff2 --layout-features='*' --glyph-names --symbol-cmap --legacy-cmap \
  --notdef-glyph --notdef-outline --recommended-glyphs
```

Run `npm run verify:fonts` after changing either font or any text rendered in these faces.
The verifier binds the declared coverage to exact binary hashes and checks both source and
built copies, dynamic labels, dev controls, sponsor lockups, and the system-font boundary
around the static SEO fallback and navigation.
