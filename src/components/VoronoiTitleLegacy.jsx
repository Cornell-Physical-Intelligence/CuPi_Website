import { useEffect, useRef, useState } from 'react';
import { P, applyParam } from './voronoiConfig';
import { createVoronoiEngine } from './voronoiEngine';
import './VoronoiTitle.css';

const FONT_WANTED = '700 100px "Playfair Display"';

/**
 * Exact main-thread fallback for browsers without the complete OffscreenCanvas feature set.
 * The deterministic engine is shared with the worker; this component only owns browser
 * lifecycle, input, visibility, resize, and font-loading coordination.
 */
export default function VoronoiTitleLegacy({ text = 'CUPI', apiRef }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [aspect, setAspect] = useState(3.2);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const createCanvas = () => document.createElement('canvas');
    let disposed = false;
    let started = false;
    let running = false;
    let engine = null;
    let raf = 0;
    let resizeRaf = 0;

    const frame = () => {
      if (disposed || !engine) {
        raf = 0;
        return;
      }
      engine.tick();
      raf = running ? requestAnimationFrame(frame) : 0;
    };

    const ensureLoop = () => {
      if (!raf && running && engine) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (started || disposed) return;
      started = true;
      engine = createVoronoiEngine({
        canvas,
        createCanvas,
        text,
        cssWidth: wrap.clientWidth || 600,
        dpr: Math.min(2, window.devicePixelRatio || 1),
        reduced,
        params: P,
        onReady: ({ aspect: nextAspect }) => {
          if (disposed) return;
          setAspect(nextAspect);
          setReady(true);
        },
      });
      running = true;
      ensureLoop();
    };

    const rebuild = () => {
      engine?.update(P, 'rebuild');
      ensureLoop();
    };
    const poke = () => {
      engine?.update(P, 'poke');
      ensureLoop();
    };
    const reseed = () => {
      applyParam('seed', (Math.floor(Math.random() * 0xffffff) + 1) >>> 0);
      rebuild();
    };
    if (apiRef) apiRef.current = { rebuild, poke, reseed };

    // Canvas font strings do not start a font request. Ask for the exact face, while
    // retaining the original 1.6s Georgia fallback and late-font rebake behavior.
    const fallback = setTimeout(() => {
      if (!disposed && !started) start();
    }, 1600);
    let fontLoad;
    try {
      fontLoad = document.fonts?.load
        ? document.fonts.load(FONT_WANTED, text)
        : Promise.resolve();
    } catch {
      fontLoad = Promise.resolve();
    }
    Promise.resolve(fontLoad)
      .catch(() => {})
      .then(() => {
        if (disposed) return;
        clearTimeout(fallback);
        if (started) {
          engine?.refreshFont();
          ensureLoop();
        } else {
          start();
        }
      });
    const onFontsDone = () => {
      if (engine?.refreshFont()) ensureLoop();
    };
    document.fonts?.addEventListener?.('loadingdone', onFontsDone);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && started) {
          running = true;
          ensureLoop();
        } else {
          running = false;
          if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (started) {
        running = true;
        ensureLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onPointerMove = (event) => {
      if (!engine) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const active = x >= -0.15 && x <= 1.15 && y >= -0.15 && y <= 1.15;
      engine.pointer(x, y, active);
      if (active) ensureLoop();
    };
    const clearPointer = () => engine?.pointer(0, 0, false);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', clearPointer);

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (disposed || !engine) return;
        engine.resize(
          wrap.clientWidth || 600,
          Math.min(2, window.devicePixelRatio || 1)
        );
      });
    });
    ro.observe(wrap);

    return () => {
      disposed = true;
      running = false;
      if (apiRef) apiRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      clearTimeout(fallback);
      document.fonts?.removeEventListener?.('loadingdone', onFontsDone);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerleave', clearPointer);
      engine?.dispose();
    };
  }, [text, apiRef]);

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
