import { useEffect, useRef, useState } from 'react';

/**
 * The full-screen shell both the gallery lightbox and the report viewer sit in: mounts on
 * open, fades in, and — the part that needs any code at all — stays mounted long enough on
 * close to fade back out.
 *
 * Both overlays were `<AnimatePresence>` wrapping a `<motion.div>`, which is the only thing
 * either of them used from `motion`. That is 42KB gzipped, a quarter of the JavaScript on
 * the site, loaded by every visitor on every page, to cross-fade two elements over 200ms
 * that a stylesheet can cross-fade for nothing. The exit animation is the reason a library
 * gets reached for here — React unmounts immediately and CSS cannot transition something
 * that is gone — and that is what the `closing` state below is for.
 *
 * The caller keeps owning the open/closed decision; this only owns the delay between the
 * two. Enter and exit transitions live in each overlay's own stylesheet, keyed off
 * `.is-entered`, so the durations stay next to the rest of that overlay's appearance.
 */
export default function Overlay({
  open,
  onClose,
  className = '',
  duration = 200,
  children,
  ...rest
}) {
  // `lingering` is what keeps the element in the DOM after `open` goes false; `entered` is
  // what drives the transition. Being open is enough to render, so neither has to be set
  // during the render that opens it — which is what lets every setState below sit inside a
  // frame or a timer callback rather than running synchronously inside an effect.
  const [lingering, setLingering] = useState(false);
  const [entered, setEntered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Two frames, not one. Mounting and adding the class in the same frame gives the
      // browser a single style resolution to work from, and it transitions nothing — the
      // element has to be painted in its starting state before the end state is applied.
      const raf = requestAnimationFrame(() => {
        setLingering(true);
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(raf);
    }

    if (!lingering) return undefined;
    timerRef.current = window.setTimeout(() => {
      setLingering(false);
      setEntered(false);
    }, duration);
    return () => window.clearTimeout(timerRef.current);
  }, [open, lingering, duration]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open && !lingering) return null;

  return (
    <div
      className={`${className} ${open && entered ? 'is-entered' : ''}`.trim()}
      onClick={onClose}
      {...rest}
    >
      {children}
    </div>
  );
}
