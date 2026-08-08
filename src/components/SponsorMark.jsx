import { useEffect, useId, useState } from 'react';
import './SponsorMark.css';

// Drawn rather than shipped as an image: a sponsor without a logo file still gets a real
// mark — its name set on a plate — instead of a line of body text sitting in a row of
// logos.

const deg = (d) => (d * Math.PI) / 180;
const round = (n) => Math.round(n * 1000) / 1000;

/* A squircle, not a rounded rectangle. `border-radius` splices a straight edge onto a
   circular arc, and curvature jumps from 0 to 1/r right at that seam — the corner reads as
   pinched even when you can't name why. G2 means curvature itself is continuous across the
   join, so the edge eases into the turn. This is the construction Figma exposes as "corner
   smoothing": the 90° arc is cut short and the leftover angle is carried by a cubic on
   either side of it, each laid out to meet the arc at matching curvature.

   `smoothing` is that slider — 0 is a plain arc, 1 leaves no arc at all. The turn begins
   p = (1 + smoothing) * radius back from the corner, so p must stay under half the shorter
   side or opposite corners would run into each other. Segment names follow the derivation
   in "Desperately seeking squircles" (Figma, 2019).

   The corners are emitted as relative segments, so only the straight runs between them care
   about the box being a rectangle rather than a square. `sharp` names the one corner left
   as a plain vertex — three smoothed corners and one square one reads as a decision, where
   four of either reads as a default. */
const CORNERS = { TOP_RIGHT: 0, BOTTOM_RIGHT: 1, BOTTOM_LEFT: 2, TOP_LEFT: 3 };

function squircle(w, h, radius, smoothing, sharp) {
  const p = (1 + smoothing) * radius;
  const sweep = 90 * (1 - smoothing); // degrees still spent on a true arc
  const arc = Math.sin(deg(sweep / 2)) * radius * Math.SQRT2; // its span on each axis
  const alpha = (90 - sweep) / 2;
  const c = radius * Math.tan(deg((45 * smoothing) / 2)) * Math.cos(deg(alpha));
  const d = c * Math.tan(deg(alpha));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;

  // a + b + c + d + arc === p, which is what lands each corner back on the straight edges.
  const e = round(a + b + c);
  const ab = round(a + b);
  const bc = round(b + c);
  const [A, C, D, R, S, P] = [a, c, d, radius, arc, p].map(round);

  // Clockwise from the top edge. Each turn starts p back from its corner and ends p past
  // it, so a sharp corner is just the two straight runs meeting at the vertex instead.
  const turns = [
    [`c ${A} 0 ${ab} 0 ${e} ${D}`, `a ${R} ${R} 0 0 1 ${S} ${S}`, `c ${D} ${C} ${D} ${bc} ${D} ${e}`],
    [`c 0 ${A} 0 ${ab} ${-D} ${e}`, `a ${R} ${R} 0 0 1 ${-S} ${S}`, `c ${-C} ${D} ${-bc} ${D} ${-e} ${D}`],
    [`c ${-A} 0 ${-ab} 0 ${-e} ${-D}`, `a ${R} ${R} 0 0 1 ${-S} ${-S}`, `c ${-D} ${-C} ${-D} ${-bc} ${-D} ${-e}`],
    [`c 0 ${-A} 0 ${-ab} ${D} ${-e}`, `a ${R} ${R} 0 0 1 ${S} ${-S}`, `c ${C} ${-D} ${bc} ${-D} ${e} ${-D}`],
  ];
  const entry = [[round(w - p), 0], [w, round(h - p)], [P, h], [0, P]];
  const vertex = [[w, 0], [w, h], [0, h], [0, 0]];

  const out = [`M ${entry[0][0]} ${entry[0][1]}`];
  for (let i = 0; i < 4; i += 1) {
    out.push(i === sharp ? `L ${vertex[i][0]} ${vertex[i][1]}` : turns[i].join(' '));
    const next = entry[(i + 1) % 4];
    out.push(`L ${next[0]} ${next[1]}`);
  }
  out.push('Z');
  return out.join(' ');
}

// The plate's own grid, in SVG units; CSS scales the whole thing. Only the width varies,
// with the name it has to hold. A radius of 11 against a height of 48 keeps a short flat
// run down each end — the plate still reads as a rectangle, which a fully rounded one
// stops doing — while spending nearly the whole corner on the smoothed curve.
const HEIGHT = 48;
const RADIUS = 11;
const SMOOTHING = 0.8;
const SHARP = CORNERS.BOTTOM_LEFT;
const PAD_X = 15; // a little more than the 12.8 above and below the caps, which is what it
                  // takes for a plate to look evenly padded

// Already self-hosted and preloaded for the hero, so it costs no extra request here.
const FONT = "'Playfair Display', 'Times New Roman', Times, serif";
const FONT_SIZE = 32;
const TRACKING = 0.01; // em
// Playfair's caps are 0.7em, so a baseline this far below centre puts the cap band — very
// nearly all the ink in a name — centred on the plate rather than the em box, which sits
// low because of the descender.
const BASELINE = HEIGHT / 2 + (FONT_SIZE * 0.7) / 2;

// The plate has to be built at a known width, because a squircle can't survive being
// stretched — non-uniform scaling turns those corners into ellipses. So measure the name
// the same way MetalWord does, on a throwaway canvas, and size the box to the answer.
// letter-spacing isn't part of measureText, hence the second term.
function measure(name) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `700 ${FONT_SIZE}px ${FONT}`;
  return ctx.measureText(name).width + name.length * TRACKING * FONT_SIZE;
}

export default function SponsorMark({ name }) {
  // Two marks on one page would otherwise share a gradient id, and the second would paint
  // with the first one's stops.
  const ink = `${useId()}-ink`;
  // Measured up front so the first paint is already the right width, then again once the
  // font is in: before it lands the canvas answers with the fallback serif's metrics.
  const [textWidth, setTextWidth] = useState(() => measure(name));

  useEffect(() => {
    let cancelled = false;
    const remeasure = () => {
      if (!cancelled) setTextWidth(measure(name));
    };
    remeasure();
    document.fonts?.ready.then(remeasure).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [name]);

  const width = Math.round(textWidth + PAD_X * 2);

  return (
    <svg
      className="sponsor-mark"
      viewBox={`0 0 ${width} ${HEIGHT}`}
      role="img"
      aria-label={name}
      // The plate is a fixed drawing, so its width has to follow from its height rather
      // than from whatever the row happens to be.
      style={{ '--mark-ratio': width / HEIGHT }}
    >
      <defs>
        <linearGradient id={ink} x1="0" y1="0" x2="0" y2="1">
          <stop className="sponsor-mark__ink-top" offset="0" />
          <stop className="sponsor-mark__ink-bottom" offset="1" />
        </linearGradient>
      </defs>
      <path
        className="sponsor-mark__plate"
        d={squircle(width, HEIGHT, RADIUS, SMOOTHING, SHARP)}
      />
      <text
        className="sponsor-mark__word"
        x={width / 2}
        y={BASELINE}
        textAnchor="middle"
        fill={`url(#${ink})`}
      >
        {name}
      </text>
    </svg>
  );
}
