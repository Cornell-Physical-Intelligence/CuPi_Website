import { pictureFromCandidates } from '../utils/responsiveImage';

// Each master in public/img/Gallery is served in two forms, both produced by
// scripts/build-assets.mjs:
//
//   thumbs/  the tapestry tile — at most a third of the viewport, so it stops at 1280
//   full/    the lightbox — 90vw x 85vh, which on a tall 2x display is ~2560 device px
//
// The masters themselves (up to 5.7MB of PNG) are never requested by the page. They stay
// in the repo as the source the derivatives are cut from.
export const GALLERY_IMAGES = [
  { filename: 'PixelHands.png', name: 'PixelHands', author: 'Sophie', width: 750, height: 1128 },
  { filename: 'HexapodLeg.jpeg', name: 'HexapodLeg', author: 'Hamilton', width: 4783, height: 2782 },
  { filename: 'DragonFlyTop.png', name: 'DragonFlyTop', author: 'Sophie', width: 1118, height: 1324 },
  { filename: 'PosterSlide.png', name: 'PosterSlide', author: 'Hamilton', width: 1346, height: 1440 },
  { filename: 'GlitchDrone.png', name: 'GlitchDrone', author: 'Andre', width: 1024, height: 1024 },
  { filename: 'PosterSketch.png', name: 'PosterSketch', author: 'Hamilton', width: 1792, height: 2400 },
  { filename: 'VTOL.png', name: 'VTOL', author: 'Andre', width: 2644, height: 1314 },
  { filename: 'HandsSketch.png', name: 'HandsSketch', author: 'Sophie', width: 1670, height: 2591 },
  { filename: 'MetalPoster.png', name: 'MetalPoster', author: 'Sophie', width: 1792, height: 2215 },
  { filename: 'Separated.png', name: 'Separated', author: 'Hamilton', width: 848, height: 721 },
  { filename: 'PosterRed.png', name: 'PosterRed', author: 'Hamilton', width: 880, height: 1168 },
  { filename: 'Spider.png', name: 'Spider', author: 'Sophie', width: 2016, height: 2112 },
];

const GALLERY_TARGETS = {
  thumb: [640, 960, 1280],
  full: [1600, 2560],
};
const pictureCache = new WeakMap();

// The asset pipeline has two deterministic resize families. Thumbs are capped by width;
// full images by their long edge. Source dimensions are kept beside the existing gallery
// metadata, and vite.config.js validates every reconstructed public record against the
// generated manifest. That avoids shipping duplicate AVIF/WebP paths and descriptors.
export const galleryPictureFor = (image, kind) => {
  let cached = pictureCache.get(image);
  if (!cached) {
    cached = {};
    pictureCache.set(image, cached);
  }
  if (cached[kind]) return cached[kind];

  const thumb = kind === 'thumb';
  const measured = thumb ? image.width : Math.max(image.width, image.height);
  const targets = [...new Set(GALLERY_TARGETS[kind].map((size) => Math.min(size, measured)))];
  const folder = thumb ? 'thumbs' : 'full';
  const candidates = targets.map((target) => {
    const width = thumb || image.width >= image.height
      ? target
      : Math.round((image.width * target) / image.height);
    const height = thumb
      ? (target === image.width ? image.height : Math.round((image.height * target) / image.width))
      : (image.height > image.width ? target : Math.round((image.height * target) / image.width));
    return {
      base: `/img/Gallery/${folder}/${image.name}-${target}`,
      width,
      height,
    };
  });

  cached[kind] = pictureFromCandidates(candidates);
  return cached[kind];
};

// The tile's share of the viewport, matching the column counts in Gallery.css exactly.
// Getting this wrong is expensive in one direction only: too large a claim and every
// visitor downloads a file no display can resolve.
export const GALLERY_TILE_SIZES =
  '(min-width: 1600px) 25vw, (min-width: 900px) 33vw, (min-width: 480px) 50vw, 100vw';

// The lightbox is bounded by both axes, and which one binds depends on the image. 90vw is
// the honest upper bound; the height cap only ever makes the real box smaller.
export const GALLERY_FULL_SIZES = '90vw';

// Aspect ratio comes from the encoded thumb rather than a hand-kept number, so a re-cut
// master can never leave the tapestry reserving the wrong box.
export const galleryAspect = (image) => {
  const thumb = galleryPictureFor(image, 'thumb');
  return thumb ? `${thumb.width}/${thumb.height}` : undefined;
};
