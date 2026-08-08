import { assetPath } from '../utils/assetPath';

// Each entry carries a cover image plus a folder of per-page renders, produced from the
// PDF at build-prep time. Pages are images rather than an embedded PDF so the viewer can
// be styled and scrolled like the rest of the site instead of handing off to the
// browser's built-in reader, which we can't theme and which degrades badly on mobile.
export const PUBLICATIONS = [
  {
    slug: 'vq1-deterministic-policy',
    // Card copy stays to two sentences, but has to define the competition: a visitor
    // has no idea what the AI Grand Prix is. The full academic title lives on the
    // paper's own first page, one click away.
    title: 'Anduril AI-GP Qual 1',
    subtitle:
      'Clearing every gate of the first qualifier in Anduril\'s autonomous drone racing competition, with no learned components.',
    authors: 'AI-GP Autonomy Team',
    year: 2026,
    pageCount: 3,
  },
  {
    slug: 'racing-without-a-map',
    title: 'Racing Without a Map',
    subtitle:
      'A meta analysis of roughly 400 papers on drone control, perception, and guidance, and what survives when a racing drone loses all telemetry.',
    authors: 'AI-GP Autonomy Team',
    year: 2026,
    pageCount: 16,
  },
];

export const getPublicationCover = (slug) =>
  assetPath(`img/Publications/${slug}-cover.webp`);

export const getPublicationPage = (slug, page) =>
  assetPath(`img/Publications/${slug}/p${String(page).padStart(2, '0')}.webp`);

export const getPublicationPdf = (slug) => assetPath(`docs/${slug}.pdf`);
