// Live, mutable tuning for the Voronoi / Physarum title effect.
// The control panel mutates THIS object in place; the simulation reads it every frame
// (so most changes are instant). Params flagged `rebuild` are only consumed when the
// sim grid is generated, so the panel triggers a rebuild for those.

export const P = {
  // Defaults below are the tuned preset (high-res, large open cells, thick membranes).
  seed: 911737,
  simH: 480, // internal resolution; higher = smoother upscale (no blur needed)
  sites: 80, // Voronoi cells — fewer = larger/more open cells
  sigma: 2.7, // membrane thickness
  border: 0.0016, // glyph outline width (× device px): paints over the AA fringe at the
  // letter edge for a clean, crisp border (black on the dark theme, white on the light)

  agentDensity: 0.285, // living "swimming" slime agents inside the letters
  highways: 26,
  warp1: 2.6,
  warp2: 2.1,
  speed: 1.15,
  deposit: 2.2,
  sensorDist: 4.4,
  sensorAngle: 0.62,
  turn: 0.43,
  decay: 0.974, // higher = worm trails persist ("keep") instead of fading fast
  blur: 0.3, // slime diffusion (sim physics — not an image blur)
  scaffold: 1.14,
  exposure: 1.15,
  edgeLo: 0.4, // field value where the membrane edge starts (cover = 0)
  edgeHi: 0.74, // field value where the membrane is solid (cover = 1)
  sharpen: 8, // display-resolution contrast that turns the soft ramp back into a crisp edge
  distanceField: true, // threshold the ~linear wall distance (smoother) vs the Gaussian
  lineHalf: 1.3, // wall distance at the visible vein edge — i.e. line weight (finer)
  band: 1.4, // width of the soft AA ramp; the contrast pass re-crisps it
  trailBoost: 0.045, // how much slime density thickens/extends the veins
  bloom: 0,
  rim: 0.2,
  mouseFeed: 1.6, // cursor feeds (thickens veins) + attracts the slime
  invert: true, // light theme: white page, black letter fill, white strands + border
};

// Pristine snapshot for the panel's Reset button.
export const P_DEFAULTS = { ...P };

// Mutators live in this module so components never assign to the shared object directly
// (the react-hooks immutability rule forbids that). Components call these instead.
export function applyParam(key, value) {
  P[key] = value;
}
export function toggleParam(key) {
  P[key] = !P[key];
  return P[key];
}
export function resetParams() {
  Object.assign(P, P_DEFAULTS);
}

// Serialize the current settings to a JSON string (for the Export button).
export function exportParams() {
  return JSON.stringify(P, null, 2);
}

// Merge a parsed settings object back into P — only known keys with a matching type,
// so a hand-edited/partial preset can't inject junk. Returns how many keys were applied.
export function importParams(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  let applied = 0;
  for (const key of Object.keys(P_DEFAULTS)) {
    if (key in obj && typeof obj[key] === typeof P_DEFAULTS[key]) {
      P[key] = obj[key];
      applied += 1;
    }
  }
  return applied;
}

// Slider metadata, grouped for the panel. `rebuild: true` ⇒ regenerate the web on change.
export const PARAM_GROUPS = [
  {
    title: 'Structure',
    note: 'rebuilds the web',
    params: [
      { key: 'simH', label: 'Resolution', min: 120, max: 480, step: 10, rebuild: true },
      { key: 'sites', label: 'Cells', min: 40, max: 800, step: 10, rebuild: true },
      { key: 'sigma', label: 'Membrane σ', min: 0.5, max: 5, step: 0.1, rebuild: true },
      { key: 'agentDensity', label: 'Agent density', min: 0, max: 0.3, step: 0.005, rebuild: true },
      { key: 'highways', label: 'Highways', min: 0, max: 60, step: 1, rebuild: true },
      { key: 'warp1', label: 'Warp 1', min: 0, max: 10, step: 0.1, rebuild: true },
      { key: 'warp2', label: 'Warp 2', min: 0, max: 10, step: 0.1, rebuild: true },
    ],
  },
  {
    title: 'Motion',
    params: [
      { key: 'speed', label: 'Speed', min: 0, max: 3, step: 0.05 },
      { key: 'deposit', label: 'Deposit', min: 0, max: 6, step: 0.1 },
      { key: 'sensorDist', label: 'Sensor dist', min: 0.5, max: 12, step: 0.1 },
      { key: 'sensorAngle', label: 'Sensor angle', min: 0.05, max: 1.6, step: 0.01 },
      { key: 'turn', label: 'Turn', min: 0, max: 1.5, step: 0.01 },
      { key: 'decay', label: 'Trail decay', min: 0.9, max: 0.999, step: 0.001 },
      { key: 'blur', label: 'Diffusion', min: 0, max: 1, step: 0.01 },
      { key: 'trailBoost', label: 'Trail boost', min: 0, max: 0.2, step: 0.005 },
      { key: 'mouseFeed', label: 'Mouse feed', min: 0, max: 4, step: 0.1 },
    ],
  },
  {
    title: 'Render',
    params: [
      { key: 'border', label: 'Border width', min: 0, max: 0.005, step: 0.0001 },
      { key: 'sharpen', label: 'Edge sharpen', min: 1, max: 20, step: 0.5 },
      { key: 'lineHalf', label: 'Line weight', min: 0.2, max: 4, step: 0.05 },
      { key: 'band', label: 'AA band', min: 0.2, max: 4, step: 0.05 },
      { key: 'exposure', label: 'Exposure', min: 0.1, max: 3, step: 0.05 },
      { key: 'scaffold', label: 'Scaffold', min: 0, max: 3, step: 0.05 },
      { key: 'edgeLo', label: 'Edge lo', min: 0, max: 1, step: 0.01 },
      { key: 'edgeHi', label: 'Edge hi', min: 0, max: 1, step: 0.01 },
      { key: 'bloom', label: 'Bloom', min: 0, max: 1, step: 0.01 },
      { key: 'rim', label: 'Rim', min: 0, max: 1, step: 0.01 },
    ],
  },
];

// Booleans rendered as switches. `theme: true` also flips the page chrome (handled in App).
export const TOGGLES = [
  { key: 'distanceField', label: 'Distance-field edges' },
  { key: 'invert', label: 'Invert colors (light theme)', theme: true },
];
