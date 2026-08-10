import manifest from '../data/generated/images.json';

// Reads the manifest that scripts/build-assets.mjs writes. The widths in a srcset have to
// be the widths of the files on disk — a wrong descriptor makes the browser pick the wrong
// file and quietly download the wrong number of bytes — so they are read from what was
// encoded rather than restated here.

const entriesFor = (group, name, format) => manifest[group]?.[name]?.[format] ?? [];

const toSrcSet = (entries) => entries.map(({ src, w }) => `${src} ${w}w`).join(', ');

/**
 * Everything a <picture> needs for one logical image.
 *
 * `avif` and `webp` are srcset strings. `src` is the largest WebP, which only a browser
 * that understands neither <source type> nor srcset would ever request — nothing that can
 * run this app. `width`/`height` are the largest variant's intrinsic size, present so the
 * box is reserved before the bytes land.
 */
export const pictureFor = (group, name) => {
  const avif = entriesFor(group, name, 'avif');
  const webp = entriesFor(group, name, 'webp');
  const largest = webp[webp.length - 1] ?? avif[avif.length - 1];

  if (!largest) {
    // A missing entry means the pipeline has not been run for this file yet. Returning
    // null lets the caller fall back to whatever it used before rather than render a
    // broken <img>.
    return null;
  }

  return {
    avif: toSrcSet(avif),
    webp: toSrcSet(webp),
    src: largest.src,
    width: largest.w,
    height: largest.h,
  };
};

export const hasPicture = (group, name) => Boolean(manifest[group]?.[name]);
