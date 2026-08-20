import { useCallback, useEffect, useRef, useState } from 'react';
import { P, applyParam } from './voronoiConfig';
import VoronoiTitleLegacy from './VoronoiTitleLegacy';
import './VoronoiTitle.css';

function workerCanvasSupported() {
  if (
    typeof Worker !== 'function' ||
    typeof OffscreenCanvas !== 'function' ||
    typeof HTMLCanvasElement === 'undefined' ||
    typeof HTMLCanvasElement.prototype.transferControlToOffscreen !== 'function'
  ) {
    return false;
  }

  try {
    const context = new OffscreenCanvas(1, 1).getContext('2d');
    // Safari currently exposes OffscreenCanvas without the 2D filter used by the exact
    // render pipeline. Reject it here so neither the worker nor its font is requested.
    return Boolean(context && 'filter' in context);
  } catch {
    return false;
  }
}

function WorkerVoronoiTitle({ text, apiRef, onFailure }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [aspect, setAspect] = useState(3.2);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    // The transfer is one-shot. Development StrictMode replays the effect against the same
    // node, so its second pass deliberately selects the exact main-thread implementation.
    if (canvas.dataset.cupiTransferred === 'true') {
      onFailure();
      return undefined;
    }
    canvas.dataset.cupiTransferred = 'true';

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let running = !document.hidden;
    let intersecting = true;
    let workerReady = false;
    let framePending = false;
    let raf = 0;
    let resizeRaf = 0;
    let simW = 0;
    let simH = 0;
    let worker;

    const fail = (error) => {
      if (disposed) return;
      disposed = true;
      worker?.terminate();
      console.warn('CUPI worker hero unavailable; using the main-thread fallback.', error);
      onFailure();
    };

    try {
      worker = new Worker(new URL('./voronoi.worker.js', import.meta.url), {
        type: 'module',
        name: 'cupi-voronoi',
      });
    } catch (error) {
      fail(error);
      return undefined;
    }

    const animationLoop = () => {
      raf = 0;
      if (disposed || !running || !workerReady) return;
      if (!framePending) {
        framePending = true;
        worker.postMessage({ type: 'tick' });
      }
      raf = requestAnimationFrame(animationLoop);
    };
    const ensureAnimationLoop = () => {
      if (!disposed && running && workerReady && !raf) {
        raf = requestAnimationFrame(animationLoop);
      }
    };

    worker.onerror = (event) => fail(event.error || event.message);
    worker.onmessageerror = (event) => fail(event);
    worker.onmessage = ({ data }) => {
      if (data.type === 'ready') {
        workerReady = true;
        simW = data.simW;
        simH = data.simH;
        setAspect(data.aspect);
        setReady(true);
        ensureAnimationLoop();
      } else if (data.type === 'frameDone') {
        framePending = false;
      } else if (data.type === 'workerError') {
        fail(data.message);
      }
    };

    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage(
        {
          type: 'init',
          canvas: offscreen,
          text,
          cssWidth: wrap.clientWidth || 600,
          dpr: Math.min(2, window.devicePixelRatio || 1),
          reduced,
          params: { ...P },
        },
        [offscreen]
      );
    } catch (error) {
      fail(error);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        intersecting = entries.some((entry) => entry.isIntersecting);
        running = !document.hidden && intersecting;
        if (running) {
          ensureAnimationLoop();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    const onVisibility = () => {
      running = !document.hidden && intersecting;
      if (running) {
        ensureAnimationLoop();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const sendPointer = (event) => {
      if (!simW || !simH) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const active = x >= -0.15 && x <= 1.15 && y >= -0.15 && y <= 1.15;
      worker.postMessage({ type: 'pointer', x, y, active });
    };
    const clearPointer = () => {
      worker.postMessage({ type: 'pointer', x: 0, y: 0, active: false });
    };
    window.addEventListener('pointermove', sendPointer, { passive: true });
    window.addEventListener('pointerdown', sendPointer, { passive: true });
    document.addEventListener('pointerleave', clearPointer);

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (disposed) return;
        worker.postMessage({
          type: 'resize',
          cssWidth: wrap.clientWidth || 600,
          dpr: Math.min(2, window.devicePixelRatio || 1),
        });
      });
    });
    ro.observe(wrap);

    const sendUpdate = (mode) => {
      if (!disposed) worker.postMessage({ type: 'update', mode, params: { ...P } });
    };
    const reseed = () => {
      applyParam('seed', (Math.floor(Math.random() * 0xffffff) + 1) >>> 0);
      sendUpdate('rebuild');
    };
    if (apiRef) {
      apiRef.current = {
        rebuild: () => sendUpdate('rebuild'),
        poke: () => sendUpdate('poke'),
        reseed,
      };
    }

    return () => {
      disposed = true;
      if (apiRef) apiRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', sendPointer);
      window.removeEventListener('pointerdown', sendPointer);
      document.removeEventListener('pointerleave', clearPointer);
      worker.postMessage({ type: 'dispose' });
      worker.terminate();
    };
  }, [text, apiRef, onFailure]);

  return (
    <div
      ref={wrapRef}
      className={`vt-title ${ready ? 'is-ready' : ''}`.trim()}
      style={{ aspectRatio: String(aspect) }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="vt-title__canvas" aria-hidden="true" />
    </div>
  );
}

export default function VoronoiTitle({ text = 'CUPI', apiRef }) {
  const [workerFailed, setWorkerFailed] = useState(false);
  const onFailure = useCallback(() => setWorkerFailed(true), []);

  if (workerFailed || !workerCanvasSupported()) {
    return <VoronoiTitleLegacy text={text} apiRef={apiRef} />;
  }

  return <WorkerVoronoiTitle text={text} apiRef={apiRef} onFailure={onFailure} />;
}
