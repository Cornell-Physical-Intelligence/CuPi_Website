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

export const preloadImages = (sources = [], { priority = 'auto', decode } = {}) => {
  if (typeof window === 'undefined') return () => {};

  const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
  if (uniqueSources.length === 0) return () => {};

  const shouldDecode = typeof decode === 'boolean' ? decode : priority === 'high';

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

      if (shouldDecode && typeof img.decode === 'function') {
        img.decode().catch(() => {}).finally(finalize);
      }
    });
  };

  const cancel = scheduleIdle(startLoading);
  return cancel;
};

/**
 * Warms the exact file a <picture> would choose, rather than a guess at it.
 *
 * Preloading a responsive image by URL is a trap: the URL that ends up on screen depends
 * on the viewport, the device pixel ratio, and whether the browser takes AVIF, so a
 * hand-picked one usually warms a file the page then does not use — paying twice. Building
 * a detached <picture> with the same sources hands the decision back to the browser's own
 * selection algorithm. The <img> begins loading as soon as its srcset is set; it never has
 * to enter the document.
 */
export const preloadPicture = ({ avif, webp, src, sizes }, { priority = 'low' } = {}) => {
  if (typeof document === 'undefined' || !src) return () => {};
  if (preloaded.has(src)) return () => {};

  return scheduleIdle(() => {
    if (preloaded.has(src)) return;
    preloaded.add(src);

    const picture = document.createElement('picture');
    if (avif) {
      const source = document.createElement('source');
      source.type = 'image/avif';
      source.srcset = avif;
      if (sizes) source.sizes = sizes;
      picture.appendChild(source);
    }

    const img = document.createElement('img');
    if ('fetchPriority' in img) img.fetchPriority = priority;
    img.decoding = 'async';
    picture.appendChild(img);

    // Set last: assigning these is what starts the fetch, and the <source> above has to
    // already be a sibling for it to be considered.
    if (sizes) img.sizes = sizes;
    if (webp) img.srcset = webp;
    img.src = src;
  });
};
