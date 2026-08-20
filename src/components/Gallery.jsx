import { useEffect, useState, useSyncExternalStore } from 'react';
import Overlay from './Overlay';
import ResponsiveImage from './ResponsiveImage';
import { preloadPicture } from '../utils/preloadImages';
import {
  GALLERY_IMAGES,
  GALLERY_FULL_SIZES,
  GALLERY_TILE_SIZES,
  galleryAspect,
  galleryPictureFor,
} from '../data/gallery';
import './Gallery.css';

// CSS columns flow top-to-bottom. These are the exact balanced column runs occupied by
// the old first-six eager group at each breakpoint (the image ratios make each run almost
// equal in height). That lets us preserve every old eager tile that can enter the first
// gallery viewport without forcing layout on the content-visibility section.
const FIRST_SIX_COLUMN_RUNS = {
  1: [[0, 1, 2, 3, 4, 5]],
  2: [[0, 1, 2, 3, 4, 5]],
  3: [[0, 1, 2, 3], [4, 5]],
  4: [[0, 1, 2], [3, 4, 5]],
};

const eagerThumbMaskFor = (viewportWidth, viewportHeight) => {
  const columnCount =
    viewportWidth <= 480 ? 1 : viewportWidth <= 900 ? 2 : viewportWidth < 1600 ? 3 : 4;
  const columnWidth = (viewportWidth - (columnCount - 1) * 2) / columnCount;
  let eagerMask = 0;

  FIRST_SIX_COLUMN_RUNS[columnCount].forEach((run) => {
    // Start above the real 28–44px label offset. Underestimating the tile top can fetch one
    // extra boundary image, but it guarantees that no formerly eager visible tile is delayed.
    let top = 0;
    run.forEach((index) => {
      if (top < viewportHeight) eagerMask |= 1 << index;
      const thumb = galleryPictureFor(GALLERY_IMAGES[index], 'thumb');
      top += columnWidth * (thumb.height / thumb.width) + 2;
    });
  });

  return eagerMask;
};

const subscribeToViewport = (notify) => {
  window.addEventListener('resize', notify, { passive: true });
  return () => window.removeEventListener('resize', notify);
};

const viewportEagerThumbMask = () =>
  eagerThumbMaskFor(window.innerWidth, window.innerHeight);

// A server render retains the legacy first-six behavior. useSyncExternalStore keeps that
// snapshot hydration-safe, then adopts the responsive client snapshot after hydration.
const serverEagerThumbMask = () => 0b111111;

// The concept-art tapestry from the old home page, lifted out of it unchanged.
// Thumbs carry the grid; the lightbox copy is only fetched on hover/focus, so
// opening it is usually instant.
export default function Gallery() {
  const eagerThumbMask = useSyncExternalStore(
    subscribeToViewport,
    viewportEagerThumbMask,
    serverEagerThumbMask,
  );
  const [expandedImage, setExpandedImage] = useState(null);
  // What was open when the lightbox started closing. The overlay outlives the state that
  // opened it by one fade, so the image has to stay addressable while that plays out.
  const [closingImage, setClosingImage] = useState(null);
  const shown = expandedImage ?? closingImage;

  // Escape is handled by Overlay.
  const closeLightbox = () => {
    setClosingImage(expandedImage);
    setExpandedImage(null);
  };

  // The lightbox covers the page, so the fixed glass bar blurs out behind it.
  // Cleared on unmount so navigating away mid-lightbox can't strand the class.
  useEffect(() => {
    document.body.classList.toggle('lightbox-open', !!expandedImage);
    return () => document.body.classList.remove('lightbox-open');
  }, [expandedImage]);

  // Whichever variant the lightbox is about to ask for, warmed while the pointer is still
  // on the tile. Handing the sources to the browser rather than naming a file keeps this
  // from warming a 2560px copy for a phone.
  const warmFullSize = (image) => {
    const full = galleryPictureFor(image, 'full');
    if (full) preloadPicture({ ...full, sizes: GALLERY_FULL_SIZES });
  };

  const markLoaded = (e) => {
    e.currentTarget.classList.add('loaded');
    // closest(), not parentElement: the <picture> wrapper is the DOM parent now.
    e.currentTarget.closest('.gallery-item')?.classList.add('is-loaded');
  };

  return (
    <>
      <section className="gallery-section">
        <h2 className="section-label">Gallery</h2>
        <div className="gallery-tapestry">
          {GALLERY_IMAGES.map((image, index) => (
            <div
              className="gallery-item"
              key={image.filename}
              onClick={() => setExpandedImage(image)}
              role="button"
              tabIndex={0}
              style={{ aspectRatio: galleryAspect(image) }}
              onMouseEnter={() => warmFullSize(image)}
              onFocus={() => warmFullSize(image)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedImage(image);
                }
              }}
            >
              <ResponsiveImage
                sources={galleryPictureFor(image, 'thumb')}
                sizes={GALLERY_TILE_SIZES}
                alt={`Concept art ${index + 1}`}
                draggable={false}
                loading={(eagerThumbMask & (1 << index)) !== 0 ? 'eager' : 'lazy'}
                decoding="async"
                /* The tapestry is several screens below the hero, so nothing in it is ever
                   the largest contentful paint. Claiming high priority only let these
                   outrank the things that are. */
                fetchPriority="low"
                onLoad={markLoaded}
                onError={markLoaded}
              />
            </div>
          ))}
        </div>
        <div className="gallery-fade-end" />
        <p className="gallery-more">(more to come)</p>
      </section>

      <Overlay
        open={Boolean(expandedImage)}
        onClose={closeLightbox}
        className="gallery-lightbox"
        role="dialog"
        aria-label="Expanded image view"
      >
        <button
          className="gallery-lightbox__close"
          onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          aria-label="Close lightbox"
        >
          &times;
        </button>
        <div
          className="gallery-lightbox__content"
          onClick={(e) => e.stopPropagation()}
        >
          {shown && (
            <>
              <ResponsiveImage
                sources={galleryPictureFor(shown, 'full')}
                sizes={GALLERY_FULL_SIZES}
                alt="Expanded view"
                draggable={false}
                decoding="async"
                fetchPriority="high"
              />
              <span className="gallery-lightbox__author">by {shown.author}</span>
            </>
          )}
        </div>
      </Overlay>
    </>
  );
}
