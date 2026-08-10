import { pictureFor } from '../utils/responsiveImage';

// Each master in public/img/Gallery is served in two forms, both produced by
// scripts/build-assets.mjs:
//
//   thumbs/  the tapestry tile — at most a third of the viewport, so it stops at 1280
//   full/    the lightbox — 90vw x 85vh, which on a tall 2x display is ~2560 device px
//
// The masters themselves (up to 5.7MB of PNG) are never requested by the page. They stay
// in the repo as the source the derivatives are cut from.
export const GALLERY_IMAGES = [
  { filename: 'PixelHands.png', name: 'PixelHands', author: 'Sophie' },
  { filename: 'HexapodLeg.jpeg', name: 'HexapodLeg', author: 'Hamilton' },
  { filename: 'DragonFlyTop.png', name: 'DragonFlyTop', author: 'Sophie' },
  { filename: 'PosterSlide.png', name: 'PosterSlide', author: 'Hamilton' },
  { filename: 'GlitchDrone.png', name: 'GlitchDrone', author: 'Andre' },
  { filename: 'PosterSketch.png', name: 'PosterSketch', author: 'Hamilton' },
  { filename: 'VTOL.png', name: 'VTOL', author: 'Andre' },
  { filename: 'HandsSketch.png', name: 'HandsSketch', author: 'Sophie' },
  { filename: 'MetalPoster.png', name: 'MetalPoster', author: 'Sophie' },
  { filename: 'Separated.png', name: 'Separated', author: 'Hamilton' },
  { filename: 'PosterRed.png', name: 'PosterRed', author: 'Hamilton' },
  { filename: 'Spider.png', name: 'Spider', author: 'Sophie' },
];

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
  const thumb = pictureFor('galleryThumb', image.name);
  return thumb ? `${thumb.width}/${thumb.height}` : undefined;
};
