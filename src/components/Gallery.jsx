import { useEffect, useState } from 'react';
import Overlay from './Overlay';
import ResponsiveImage from './ResponsiveImage';
import { preloadPicture } from '../utils/preloadImages';
import { pictureFor } from '../utils/responsiveImage';
import {
  GALLERY_IMAGES,
  GALLERY_FULL_SIZES,
  GALLERY_TILE_SIZES,
  galleryAspect,
} from '../data/gallery';
import './Gallery.css';

// The concept-art tapestry from the old home page, lifted out of it unchanged.
// Thumbs carry the grid; the lightbox copy is only fetched on hover/focus, so
// opening it is usually instant.
export default function Gallery() {
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
    const full = pictureFor('galleryFull', image.name);
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
                group="galleryThumb"
                name={image.name}
                sizes={GALLERY_TILE_SIZES}
                alt={`Concept art ${index + 1}`}
                draggable={false}
                loading={index < 6 ? 'eager' : 'lazy'}
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
                group="galleryFull"
                name={shown.name}
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
