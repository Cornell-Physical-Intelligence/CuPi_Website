import { useId } from 'react';
import './SponsorMark.css';

// Drawn rather than shipped as an image: a sponsor without a logo file still gets a real
// lockup — monogram badge plus wordmark — instead of a line of body text sitting in a row
// of logos.

const deg = (d) => (d * Math.PI) / 180;
const round = (n) => Math.round(n * 1000) / 1000;

/* A squircle, not a rounded rectangle. `border-radius` splices a straight edge onto a
   circular arc, and curvature jumps from 0 to 1/r right at that seam — the corner reads as
   pinched even when you can't name why. G2 means curvature itself is continuous across the
   join, so the edge eases into the turn. This is the construction Figma exposes as "corner
   smoothing": the 90° arc is cut short and the leftover angle is carried by a cubic on
   either side of it, each laid out to meet the arc at matching curvature.

   `smoothing` is that slider — 0 is a plain arc, 1 leaves no arc at all. The turn begins
   p = (1 + smoothing) * radius back from the corner, so p must stay under half the side or
   opposite corners would run into each other. Segment names follow the derivation in
   "Desperately seeking squircles" (Figma, 2019). */
function squircle(size, radius, smoothing) {
  const p = (1 + smoothing) * radius;
  const sweep = 90 * (1 - smoothing); // degrees still spent on a true arc
  const arc = Math.sin(deg(sweep / 2)) * radius * Math.SQRT2; // its span on each axis
  const alpha = (90 - sweep) / 2;
  const c = radius * Math.tan(deg((45 * smoothing) / 2)) * Math.cos(deg(alpha));
  const d = c * Math.tan(deg(alpha));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;

  // a + b + c + d + arc === p, which is what closes the path back onto the straight edges.
  const e = round(a + b + c);
  const ab = round(a + b);
  const bc = round(b + c);
  const [A, C, D, R, S, P] = [a, c, d, radius, arc, p].map(round);

  return [
    `M ${round(size - p)} 0`,
    `c ${A} 0 ${ab} 0 ${e} ${D}`,
    `a ${R} ${R} 0 0 1 ${S} ${S}`,
    `c ${D} ${C} ${D} ${bc} ${D} ${e}`,
    `L ${size} ${round(size - p)}`,
    `c 0 ${A} 0 ${ab} ${-D} ${e}`,
    `a ${R} ${R} 0 0 1 ${-S} ${S}`,
    `c ${-C} ${D} ${-bc} ${D} ${-e} ${D}`,
    `L ${P} ${size}`,
    `c ${-A} 0 ${-ab} 0 ${-e} ${-D}`,
    `a ${R} ${R} 0 0 1 ${-S} ${-S}`,
    `c ${-D} ${-C} ${-D} ${-bc} ${-D} ${-e}`,
    `L 0 ${P}`,
    `c 0 ${-A} 0 ${-ab} ${D} ${-e}`,
    `a ${R} ${R} 0 0 1 ${S} ${-S}`,
    `c ${C} ${-D} ${bc} ${-D} ${e} ${-D}`,
    'Z',
  ].join(' ');
}

// 64 is the badge's own grid; CSS scales it. A radius of 13 with smoothing at 0.8 keeps a
// short flat run along each side — the shape still reads as a square, which a fully
// rounded tile stops doing — while spending almost the whole corner on the smoothed curve.
const SIZE = 64;
const PLATE = squircle(SIZE, 13, 0.8);

// The outline again, pulled in half a unit on every side. Stroking PLATE itself would
// straddle the edge and leave the outer half to be clipped, which thins the hairline
// unevenly around the corners.
const EDGE_SCALE = (SIZE - 1) / SIZE;

// Playfair's caps are 0.7em, so a baseline this far below centre puts the cap band — the
// only part of a "T" that has any ink — centred in the badge rather than the em box.
const CAP = 0.7;
const FONT_SIZE = 42;
const BASELINE = SIZE / 2 + (FONT_SIZE * CAP) / 2;

export default function SponsorMark({ name }) {
  // Two marks on one page would otherwise share gradient ids, and the second would paint
  // with the first one's stops.
  const uid = useId();
  const plate = `${uid}-plate`;
  const ink = `${uid}-ink`;
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <span className="sponsor-mark">
      {/* The wordmark beside it already carries the name, so the badge is decorative. */}
      <svg className="sponsor-mark__badge" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={plate} x1="0" y1="0" x2="0" y2="1">
            <stop className="sponsor-mark__plate-top" offset="0" />
            <stop className="sponsor-mark__plate-bottom" offset="1" />
          </linearGradient>
          <linearGradient id={ink} x1="0" y1="0" x2="0" y2="1">
            <stop className="sponsor-mark__ink-top" offset="0" />
            <stop className="sponsor-mark__ink-bottom" offset="1" />
          </linearGradient>
        </defs>
        <path d={PLATE} fill={`url(#${plate})`} />
        <path
          className="sponsor-mark__edge"
          d={PLATE}
          transform={`translate(0.5 0.5) scale(${EDGE_SCALE})`}
          fill="none"
        />
        <text
          className="sponsor-mark__initial"
          x={SIZE / 2}
          y={BASELINE}
          textAnchor="middle"
          fill={`url(#${ink})`}
        >
          {initial}
        </text>
      </svg>
      <span className="sponsor-mark__word">{name}</span>
    </span>
  );
}
