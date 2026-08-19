// Reads the manifest that scripts/build-assets.mjs writes. The widths in a srcset have to
// be the widths of the files on disk — a wrong descriptor makes the browser pick the wrong
// file and quietly download the wrong number of bytes — so callers receive a build-time
// view of that generated manifest rather than restating them here.

/**
 * Everything a <picture> needs for one logical image.
 *
 * `avif` and `webp` are srcset strings. `src` is the largest WebP, which only a browser
 * that understands neither <source type> nor srcset would ever request — nothing that can
 * run this app. `width`/`height` are the largest variant's intrinsic size, present so the
 * box is reserved before the bytes land.
 */
export const pictureFor = (manifest, group, name) => {
  const picture = manifest?.[group]?.[name];
  if (!picture) {
    // A missing entry means the pipeline has not been run for this file yet. Returning
    // null lets the caller fall back to whatever it used before rather than render a
    // broken <img>.
    return null;
  }

  return picture;
};

export const hasPicture = (manifest, group, name) => Boolean(manifest?.[group]?.[name]);
