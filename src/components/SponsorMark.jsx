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
   about the box being a rectangle rather than a square. */
function squircle(w, h, radius, smoothing) {
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

  return [
    `M ${round(w - p)} 0`,
    `c ${A} 0 ${ab} 0 ${e} ${D}`,
    `a ${R} ${R} 0 0 1 ${S} ${S}`,
    `c ${D} ${C} ${D} ${bc} ${D} ${e}`,
    `L ${w} ${round(h - p)}`,
    `c 0 ${A} 0 ${ab} ${-D} ${e}`,
    `a ${R} ${R} 0 0 1 ${-S} ${S}`,
    `c ${-C} ${D} ${-bc} ${D} ${-e} ${D}`,
    `L ${P} ${h}`,
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

// The plate's own grid, in SVG units; CSS scales the whole thing. Only the width varies,
// with the name it has to hold. A radius of 17 against a height of 64 keeps a short flat
// run down each end — the plate still reads as a rectangle, which a fully rounded one
// stops doing — while spending nearly the whole corner on the smoothed curve.
const HEIGHT = 64;
const RADIUS = 17;
const SMOOTHING = 0.8;
const PAD_X = 30; // half again the space above and below the caps, which is how a plate
                  // has to be padded to look evenly padded

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
      <path className="sponsor-mark__plate" d={squircle(width, HEIGHT, RADIUS, SMOOTHING)} />
      {/* The same outline inset half a unit, rather than a stroke on the plate itself: that
          would straddle the edge and leave its outer half to be clipped. */}
      <path
        className="sponsor-mark__edge"
        d={squircle(width - 1, HEIGHT - 1, RADIUS - 0.5, SMOOTHING)}
        transform="translate(0.5 0.5)"
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
