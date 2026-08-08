// Capability check for the SVG-displacement glass effect, kept in its own module
// so both GlassSurface and its callers can import it without tripping
// react-refresh's "only export components" rule.

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
let cachedSvgFilterSupport;

// Whether GlassSurface can actually render its SVG-displacement effect here
// (true only on Chromium desktop). Returns false for Safari, Firefox, and
// touch/mobile — exactly the environments where a cross-browser glass fallback
// (SamasanteMenuGlass) should take over. Result is cached after the first call.
export function supportsGlassSurface() {
  if (!isBrowser) return false;
  if (cachedSvgFilterSupport !== undefined) return cachedSvgFilterSupport;

  // Disable on touch-primary devices (mobile, tablets).
  if (window.matchMedia?.('(pointer: coarse)')?.matches) {
    cachedSvgFilterSupport = false;
    return false;
  }

  // Must support backdrop-filter.
  if (!CSS?.supports?.('backdrop-filter', 'blur(1px)')) {
    cachedSvgFilterSupport = false;
    return false;
  }

  // SVG filter displacement via backdrop-filter only renders correctly in
  // Chromium-based browsers. Detect via the chrome global, which is present in
  // Chrome, Edge, Brave, Opera, etc.
  cachedSvgFilterSupport = 'chrome' in window;
  return cachedSvgFilterSupport;
}
