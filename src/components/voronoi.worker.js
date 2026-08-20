import { createVoronoiEngine } from './voronoiEngine';

let activeEngine = null;

async function loadPlayfair() {
  if (typeof FontFace !== 'function' || !self.fonts?.add) {
    throw new Error('Worker FontFace support is required for pixel-identical rendering.');
  }

  const url = new URL('/fonts/playfair-display-700-latin.woff2', self.location.href).href;
  const face = new FontFace('Playfair Display', `url(${url})`, {
    weight: '700',
    style: 'normal',
  });
  await face.load();
  self.fonts.add(face);
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      await loadPlayfair();
      activeEngine?.dispose();
      activeEngine = createVoronoiEngine({
        ...data,
        createCanvas: () => new OffscreenCanvas(1, 1),
        onReady: (details) => self.postMessage({ type: 'ready', ...details }),
      });
      return;
    }

    if (!activeEngine) return;
    if (data.type === 'tick') {
      activeEngine.tick();
      self.postMessage({ type: 'frameDone' });
    } else if (data.type === 'pointer') {
      activeEngine.pointer(data.x, data.y, data.active);
    } else if (data.type === 'resize') {
      activeEngine.resize(data.cssWidth, data.dpr);
    } else if (data.type === 'update') {
      activeEngine.update(data.params, data.mode);
    } else if (data.type === 'dispose') {
      activeEngine.dispose();
      activeEngine = null;
      self.close();
    }
  } catch (error) {
    self.postMessage({ type: 'workerError', message: error?.stack || String(error) });
  }
};
