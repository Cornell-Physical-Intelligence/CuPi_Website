import { useEffect, useState } from 'react';
import MetallicPaint from './vendor/MetallicPaint';
import './MetalWord.css';

// MetallicPaint fills a mask, so each tier name is first drawn to an offscreen canvas and
// handed over as a PNG data URI. Drawing it here rather than shipping images means the
// glyphs come from the page's own font stack and the words stay editable in code.
const FONT_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const WEIGHT = 700;

// Per-tier paint. lightColor/darkColor are the two ends of the metal ramp the shader
// sweeps between; tintColor pushes the whole thing warm or cool.
const PAINT = {
  gold: { lightColor: '#fff3cf', darkColor: '#3d2a00', tintColor: '#ffc94a' },
  silver: { lightColor: '#ffffff', darkColor: '#1b1e22', tintColor: '#dfe6ef' },
  bronze: { lightColor: '#ffdcc0', darkColor: '#331608', tintColor: '#d2884f' },
};

// The mask has to be SQUARE. MetallicPaint allocates a square drawing buffer and sets
// u_ratio to 1, and its own CSS adds object-fit: contain — so a wide mask in a wide box
// gets letterboxed twice and the word renders tiny. A square mask in a square element
// avoids both, and the wrapper then crops that square down to the word.
const SIDE = 600;
const FILL = 0.9; // fraction of the square the word spans

export default function MetalWord({ tier, word }) {
  const [mask, setMask] = useState(null);
  const paint = PAINT[tier] ?? PAINT.silver;

  useEffect(() => {
    let cancelled = false;

    const build = () => {
      const probe = document.createElement('canvas').getContext('2d');

      // Find the size that makes the word span FILL of the square.
      let px = SIDE * 0.5;
      probe.font = `${WEIGHT} ${px}px ${FONT_STACK}`;
      const unit = probe.measureText(word).width / px;
      px = (SIDE * FILL) / unit;

      probe.font = `${WEIGHT} ${px}px ${FONT_STACK}`;
      const m = probe.measureText(word);
      const ascent = m.actualBoundingBoxAscent || px * 0.72;
      const descent = m.actualBoundingBoxDescent || px * 0.2;
      const band = ascent + descent;

      const c = document.createElement('canvas');
      c.width = SIDE;
      c.height = SIDE;
      const ctx = c.getContext('2d');
      ctx.font = `${WEIGHT} ${px}px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      // Black on transparent, not white: processImage classifies near-white opaque pixels
      // as background, so white glyphs yield an empty mask and nothing paints.
      ctx.fillStyle = '#000000';
      ctx.fillText(word, SIDE / 2, SIDE / 2 + band / 2 - descent);

      if (!cancelled) {
        setMask({
          src: c.toDataURL('image/png'),
          // How much taller the square is than the glyphs inside it. The wrapper uses
          // this to scale the square up so the visible word matches the wrapper height.
          overscan: SIDE / band,
        });
      }
    };

    const defer = () => {
      if (cancelled) return;
      if (window.requestIdleCallback) window.requestIdleCallback(build, { timeout: 600 });
      else window.setTimeout(build, 0);
    };
    // Fonts can land after first paint and change the metrics, so wait for them.
    if (document.fonts?.ready) document.fonts.ready.then(defer).catch(defer);
    else defer();

    return () => { cancelled = true; };
  }, [word]);

  return (
    <span className={`metal-word metal-word--${tier}`}>
      {mask && (
        <span
          className="metal-word__square"
          // Square, scaled so its central word band fills the wrapper height, then
          // cropped by the wrapper's overflow.
          style={{ '--overscan': mask.overscan }}
        >
          <MetallicPaint
            imageSrc={mask.src}
            scale={5}
            speed={0.12}
            liquid={0.85}
            refraction={0.02}
            blur={0.012}
            brightness={2.1}
            contrast={0.6}
            fresnel={1.3}
            distortion={1.1}
            contour={0.28}
            patternSharpness={1.2}
            chromaticSpread={2.2}
            lightColor={paint.lightColor}
            darkColor={paint.darkColor}
            tintColor={paint.tintColor}
          />
        </span>
      )}
      {/* The visible glyphs are pixels, so keep real text for selection and screen readers. */}
      <span className="metal-word__label">{word}</span>
    </span>
  );
}
