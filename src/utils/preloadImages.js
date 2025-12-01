const preloaded = new Set();

const scheduleIdle = (task) => {
  if (typeof window === 'undefined') return () => {};
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(task, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const timeoutId = window.setTimeout(task, 200);
  return () => window.clearTimeout(timeoutId);
};

export const preloadImages = (sources = [], { priority = 'auto' } = {}) => {
  if (typeof window === 'undefined') return () => {};

  const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
  if (uniqueSources.length === 0) return () => {};

  const startLoading = () => {
    uniqueSources.forEach((src) => {
      if (preloaded.has(src)) return;

      const img = new Image();
      if ('fetchPriority' in img && priority) {
        img.fetchPriority = priority;
      }
      img.decoding = 'async';

      let settled = false;
      const finalize = () => {
        if (settled) return;
        settled = true;
        preloaded.add(src);
      };

      img.onload = finalize;
      img.onerror = finalize;
      img.src = src;

      if (typeof img.decode === 'function') {
        img.decode().catch(() => {}).finally(finalize);
      }
    });
  };

  const cancel = scheduleIdle(startLoading);
  return cancel;
};
