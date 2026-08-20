// The widths in a srcset have to be the widths of the files on disk — a wrong descriptor
// makes the browser pick the wrong file and quietly download the wrong number of bytes.
// The build validates every deterministic picture assembled here against the generated
// asset manifest before it emits production files.

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

// Turn one format-neutral candidate list into the exact public object ResponsiveImage
// consumes. Paths and dimensions are stored once; AVIF/WebP srcsets are deterministic.
export const pictureFromCandidates = (candidates) => {
  const last = candidates.at(-1);
  if (!last) return null;

  return {
    avif: candidates.map(({ base, width }) => `${base}.avif ${width}w`).join(', '),
    webp: candidates.map(({ base, width }) => `${base}.webp ${width}w`).join(', '),
    src: `${last.base}.webp`,
    width: last.width,
    height: last.height,
  };
};

// One-off page art is resized by width. Keeping the source dimensions and target widths
// is enough to reconstruct every encoded candidate without shipping a generated manifest.
export const pictureFromWidthTargets = ({ base, width, height, targets }) =>
  pictureFromCandidates(
    targets.map((target) => ({
      base: `${base}-${target}`,
      width: target,
      height: target === width ? height : Math.round((height * target) / width),
    })),
  );
