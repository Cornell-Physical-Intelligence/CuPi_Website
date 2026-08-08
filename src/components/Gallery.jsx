import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { assetPath } from '../utils/assetPath';
import { preloadImages } from '../utils/preloadImages';
import { GALLERY_IMAGES, GALLERY_THUMB_WIDTHS, getGalleryThumbPath } from '../data/gallery';
import './Gallery.css';

// The concept-art tapestry from the old home page, lifted out of it unchanged.
// Thumbs carry the grid; the full-size image is only fetched on hover/focus, so
// opening the lightbox is usually instant.
export default function Gallery() {
  const [expandedImage, setExpandedImage] = useState(null);

  // The lightbox covers the page, so the fixed glass bar blurs out behind it.
  // Cleared on unmount so navigating away mid-lightbox can't strand the class.
  useEffect(() => {
    document.body.classList.toggle('lightbox-open', !!expandedImage);
    return () => document.body.classList.remove('lightbox-open');
  }, [expandedImage]);

  useEffect(() => {
    if (!expandedImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setExpandedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedImage]);

  return (
    <>
      <section className="gallery-section">
        <h2 className="section-label">Gallery</h2>
        <div className="gallery-tapestry">
          {GALLERY_IMAGES.map((image, index) => {
            const aspectRatio = image.width && image.height ? `${image.width}/${image.height}` : undefined;
            const fullSrc = assetPath(`img/Gallery/${image.filename}`);
            const thumbSrc = getGalleryThumbPath(image.filename, GALLERY_THUMB_WIDTHS[0]);
            const thumbSrcSet = `${getGalleryThumbPath(image.filename, GALLERY_THUMB_WIDTHS[0])} ${GALLERY_THUMB_WIDTHS[0]}w, ${getGalleryThumbPath(image.filename, GALLERY_THUMB_WIDTHS[1])} ${GALLERY_THUMB_WIDTHS[1]}w`;

            return (
              <div
                className="gallery-item"
                key={image.filename}
                onClick={() => setExpandedImage(image)}
                role="button"
                tabIndex={0}
                style={aspectRatio ? { aspectRatio } : undefined}
                onMouseEnter={() => preloadImages([fullSrc], { priority: 'low' })}
                onFocus={() => preloadImages([fullSrc], { priority: 'low' })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedImage(image);
                  }
                }}
              >
                <img
                  src={thumbSrc}
                  srcSet={thumbSrcSet}
                  sizes="(min-width: 1600px) 25vw, (min-width: 900px) 33vw, (min-width: 480px) 50vw, 100vw"
                  alt={`Concept art ${index + 1}`}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index < 3 ? 'high' : 'auto'}
                  width={image.width}
                  height={image.height}
                  onLoad={(e) => {
                    e.currentTarget.classList.add('loaded');
                    e.currentTarget.parentElement?.classList.add('is-loaded');
                  }}
                  onError={(e) => {
                    e.currentTarget.classList.add('loaded');
                    e.currentTarget.parentElement?.classList.add('is-loaded');
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="gallery-fade-end" />
        <p className="gallery-more">(more to come)</p>
      </section>

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            className="gallery-lightbox"
            role="dialog"
            aria-label="Expanded image view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpandedImage(null)}
          >
            <button
              className="gallery-lightbox__close"
              onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
              aria-label="Close lightbox"
            >
              &times;
            </button>
            <motion.div
              className="gallery-lightbox__content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={assetPath(`img/Gallery/${expandedImage.filename}`)}
                alt="Expanded view"
              />
              <span className="gallery-lightbox__author">by {expandedImage.author}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
