import { useReducer, useState } from 'react';
import {
  P,
  PARAM_GROUPS,
  TOGGLES,
  applyParam,
  toggleParam,
  resetParams,
  exportParams,
  importParams,
} from './voronoiConfig';
import './Controls.css';

// Format a value to a sensible number of decimals based on its slider step.
function fmt(value, step) {
  const dot = String(step).split('.')[1];
  const decimals = dot ? Math.min(4, dot.length) : 0;
  return Number(value).toFixed(decimals);
}

/**
 * Controls — a live tuning panel for the Voronoi title effect. It mutates the shared
 * `P` object in place and then asks the canvas to repaint (poke) or regenerate (rebuild)
 * through the imperative api the title exposes via `apiRef`.
 */
export default function Controls({ apiRef, inverted, onInvertChange }) {
  // P is mutated outside React, so bump a counter to re-read it for the readouts/sliders.
  const [, bump] = useReducer((n) => n + 1, 0);
  const [preset, setPreset] = useState('');
  const [status, setStatus] = useState('');

  const flash = (msg) => {
    setStatus(msg);
    window.setTimeout(() => setStatus((s) => (s === msg ? '' : s)), 1900);
  };

  const setParam = (def, value) => {
    applyParam(def.key, value);
    if (def.rebuild) apiRef.current?.rebuild();
    else apiRef.current?.poke();
    bump();
  };

  const toggle = (t) => {
    if (t.theme) {
      onInvertChange(!inverted); // App flips page chrome + P.invert + repaints
    } else {
      toggleParam(t.key);
      apiRef.current?.poke();
    }
    bump();
  };

  const reset = () => {
    resetParams();
    onInvertChange(P.invert);
    apiRef.current?.rebuild();
    bump();
  };

  const reseed = () => {
    apiRef.current?.reseed();
    bump();
  };

  const doExport = async () => {
    const text = exportParams();
    setPreset(text);
    try {
      await navigator.clipboard.writeText(text);
      flash('Copied to clipboard');
    } catch {
      flash('Select the text below to copy');
    }
  };

  const doApply = () => {
    let obj;
    try {
      obj = JSON.parse(preset);
    } catch {
      flash('Invalid JSON');
      return;
    }
    const n = importParams(obj);
    if (!n) {
      flash('No matching settings');
      return;
    }
    onInvertChange(P.invert);
    apiRef.current?.rebuild();
    bump();
    flash(`Applied ${n} settings`);
  };

  return (
    <aside className="controls" aria-label="Effect settings">
      <header className="controls__head">
        <span className="controls__title">Effect settings</span>
        <div className="controls__actions">
          <button type="button" className="controls__btn" onClick={reseed}>
            Reseed
          </button>
          <button type="button" className="controls__btn" onClick={reset}>
            Reset
          </button>
        </div>
      </header>

      <div className="controls__body">
        {PARAM_GROUPS.map((group) => (
          <section key={group.title} className="controls__group">
            <h3 className="controls__group-title">
              {group.title}
              {group.note && <span className="controls__group-note">{group.note}</span>}
            </h3>
            {group.params.map((def) => (
              <label key={def.key} className="controls__row">
                <span className="controls__name">{def.label}</span>
                <span className="controls__val">{fmt(P[def.key], def.step)}</span>
                <input
                  className="controls__range"
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={P[def.key]}
                  onChange={(e) => setParam(def, Number(e.target.value))}
                />
              </label>
            ))}
          </section>
        ))}

        <section className="controls__group">
          <h3 className="controls__group-title">Toggles</h3>
          {TOGGLES.map((t) => {
            const on = t.theme ? inverted : P[t.key];
            return (
              <label key={t.key} className="controls__switch">
                <input type="checkbox" checked={!!on} onChange={() => toggle(t)} />
                <span>{t.label}</span>
              </label>
            );
          })}
        </section>

        <section className="controls__group">
          <h3 className="controls__group-title">
            Preset (JSON)
            {status && <span className="controls__status">{status}</span>}
          </h3>
          <div className="controls__io-actions">
            <button type="button" className="controls__btn" onClick={doExport}>
              Export
            </button>
            <button
              type="button"
              className="controls__btn"
              onClick={doApply}
              disabled={!preset.trim()}
            >
              Apply
            </button>
          </div>
          <textarea
            className="controls__io"
            spellCheck={false}
            rows={5}
            value={preset}
            placeholder="Click Export to dump the current settings — or paste a preset here and Apply."
            onChange={(e) => setPreset(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </section>
      </div>
    </aside>
  );
}
