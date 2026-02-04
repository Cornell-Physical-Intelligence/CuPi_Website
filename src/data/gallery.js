import { assetPath } from '../utils/assetPath';

export const GALLERY_IMAGES = [
  { filename: 'PixelHands.png', author: 'Sophie', width: 750, height: 1128 },
  { filename: 'HexapodLeg.jpeg', author: 'Hamilton', width: 4783, height: 2782 },
  { filename: 'DragonFlyTop.png', author: 'Sophie', width: 850, height: 1000 },
  { filename: 'PosterSlide.png', author: 'Hamilton', width: 1346, height: 1440 },
  { filename: 'GlitchDrone.png', author: 'Andre', width: 1024, height: 1024 },
  { filename: 'PosterSketch.png', author: 'Hamilton', width: 1792, height: 2400 },
  { filename: 'VTOL.png', author: 'Andre', width: 2644, height: 1314 },
  { filename: 'HandsSketch.png', author: 'Sophie', width: 1000, height: 1600 },
  { filename: 'MetalPoster.png', author: 'Sophie', width: 1792, height: 2215 },
  { filename: 'Separated.png', author: 'Hamilton', width: 848, height: 721 },
  { filename: 'PosterRed.png', author: 'Hamilton', width: 880, height: 1168 },
  { filename: 'Spider.png', author: 'Sophie', width: 1100, height: 1100 }
];

export const GALLERY_THUMB_WIDTHS = [640, 1280];

export const getGalleryThumbName = (filename, width) =>
  `${filename.replace(/\.[^.]+$/, '')}-${width}.webp`;

export const getGalleryThumbPath = (filename, width) =>
  assetPath(`img/Gallery/thumbs/${getGalleryThumbName(filename, width)}`);
