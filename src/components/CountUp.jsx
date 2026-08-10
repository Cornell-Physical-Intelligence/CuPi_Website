import { useCallback, useEffect, useMemo, useRef } from 'react';

// Counts from one number to another when it scrolls into view.
//
// This used to be three hooks from `motion` — useInView, useMotionValue, useSpring — which
// made a 42KB gzipped animation library part of the home page's critical path in order to
// animate one integer. The spring below is the same second-order system those hooks
// integrate, with the same stiffness, damping and unit mass, so the number moves the way it
// did; what it no longer does is arrive with a physics engine attached.

const getDecimalPlaces = (num) => {
  const str = num.toString();
  if (str.includes('.')) {
    const decimals = str.split('.')[1];
    if (parseInt(decimals, 10) !== 0) {
      return decimals.length;
    }
  }
  return 0;
};

// Fixed sub-steps rather than integrating over the whole frame delta: a long frame (a tab
// regaining focus, a slow paint) would otherwise take one huge step and can make a stiff
// spring overshoot or diverge outright.
const STEP = 1 / 120;
const REST_DISTANCE = 0.005;
const REST_VELOCITY = 0.05;

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}) {
  const ref = useRef(null);
  const frameRef = useRef(0);

  // Matches the mapping the previous implementation used, so a given `duration` produces
  // the same curve it always did. Mass is 1, as it was.
  const { damping, stiffness } = useMemo(() => {
    const safeDuration = Math.max(duration, 0.1);
    return {
      damping: 20 + 40 * (1 / safeDuration),
      stiffness: 100 * (1 / safeDuration)
    };
  }, [duration]);

  const maxDecimals = useMemo(
    () => Math.max(getDecimalPlaces(from), getDecimalPlaces(to)),
    [from, to]
  );

  const numberFormatter = useMemo(() => {
    const hasDecimals = maxDecimals > 0;
    return new Intl.NumberFormat('en-US', {
      useGrouping: !!separator,
      minimumFractionDigits: hasDecimals ? maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? maxDecimals : 0
    });
  }, [maxDecimals, separator]);

  const formatValue = useCallback(
    (latest) => {
      const formattedNumber = numberFormatter.format(latest);
      if (separator && separator !== ',') {
        return formattedNumber.replace(/,/g, separator);
      }
      return formattedNumber;
    },
    [numberFormatter, separator]
  );

  const start = direction === 'down' ? to : from;
  const target = direction === 'down' ? from : to;

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(start);
    }
  }, [start, formatValue]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !startWhen) return undefined;

    let timeoutId;
    let cancelled = false;

    const run = () => {
      onStart?.();
      let value = start;
      let velocity = 0;
      let previous = performance.now();
      let carry = 0;

      const tick = (now) => {
        if (cancelled) return;
        // A backgrounded tab can hand back a delta of many seconds; clamp it so the
        // animation resumes rather than teleports.
        const elapsed = Math.min((now - previous) / 1000, 0.25);
        previous = now;
        carry += elapsed;

        while (carry >= STEP) {
          const acceleration = -stiffness * (value - target) - damping * velocity;
          velocity += acceleration * STEP;
          value += velocity * STEP;
          carry -= STEP;
        }

        if (Math.abs(target - value) < REST_DISTANCE && Math.abs(velocity) < REST_VELOCITY) {
          node.textContent = formatValue(target);
          onEnd?.();
          return;
        }

        node.textContent = formatValue(value);
        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timeoutId = window.setTimeout(run, delay * 1000);
      },
      { threshold: 0 }
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(frameRef.current);
    };
  }, [startWhen, delay, start, target, stiffness, damping, formatValue, onStart, onEnd]);

  return <span className={className} ref={ref} />;
}
