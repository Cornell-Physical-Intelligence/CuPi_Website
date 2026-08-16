import { assetPath } from '../utils/assetPath';
import { REPORT_CONTENT } from './reportContent.js';

// Technical reports, not publications: these are written and released by the team, not
// accepted anywhere, and calling them publications overstated it.
//
// Each entry carries a cover image plus a folder of per-page renders, produced from the
// PDF at build-prep time. Pages are images rather than an embedded PDF so the viewer can
// be styled and scrolled like the rest of the site instead of handing off to the
// browser's built-in reader, which we can't theme and which degrades badly on mobile.
export const REPORTS = REPORT_CONTENT.map((report) => ({
  ...report,
  title: report.cardTitle,
  subtitle: report.cardSubtitle,
}));

// Covers are rendered straight from the PDF at the three sizes the card can actually
// need -- it is 200-240 CSS px wide, so 240/480/720 is exactly 1x/2x/3x and nothing is
// downloaded that a display cannot resolve. Re-rendering from the source beats
// downscaling the old 816px file, which was already lossy.
const COVER_WIDTHS = [240, 480, 720];

export const getReportCoverSet = (slug, ext) =>
  COVER_WIDTHS.map((w) => `${assetPath(`img/Reports/${slug}-cover-${w}.${ext}`)} ${w}w`)
    .join(', ');

// Fallback for browsers that take neither <source>: the 2x file, which is the one most
// displays would have picked anyway.
export const getReportCover = (slug) =>
  assetPath(`img/Reports/${slug}-cover-480.webp`);

// Page renders are addressed through the generated manifest rather than by path, because
// each one exists at two widths in two formats and the viewer has to be handed the whole
// set to choose from. The 1122px master stays the top tier — it is what the PDF was
// rendered at, and re-rendering larger is the only way past it.
export const getReportPageGroup = (slug) => `report:${slug}`;

export const getReportPageName = (page) => `p${String(page).padStart(2, '0')}`;

// The viewer caps a page at 860 CSS px and drops to full width once the column no longer
// fits beside the scroll container's padding.
export const REPORT_PAGE_SIZES = '(max-width: 940px) 100vw, 860px';

export const getReportPdf = (slug) => assetPath(`docs/${slug}.pdf`);
