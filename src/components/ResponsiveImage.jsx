import { pictureFor } from '../utils/responsiveImage';

/**
 * One <img>, offered in AVIF first and WebP second, at every size the pipeline produced.
 *
 * The <picture> element is `display: contents` (see index.css), so it adds a DOM node but
 * no box: an absolutely positioned still, a grid child, and a flex item all lay out
 * exactly as they did when the <img> was the direct child. Code reacting to load still
 * has to use `closest()` rather than `parentElement`, because the DOM parent really is
 * the <picture>.
 *
 * `sizes` is not optional in practice. Without it the browser assumes the image fills the
 * viewport and picks the largest file in the set, which is the exact failure this is meant
 * to avoid.
 */
export default function ResponsiveImage({
  manifest,
  group,
  name,
  sources,
  sizes,
  alt = '',
  fallback,
  ...imgProps
}) {
  // Most callers name a group in the generated manifest. The roster is the exception: its
  // portraits live under src/ so that Vite content-hashes them, which means their URLs
  // only exist after the bundler has seen them. Its build-time virtual manifest exposes
  // those URLs and the page passes the same picture shape in through `sources`.
  const picture = sources ?? pictureFor(manifest, group, name);

  if (!picture) {
    return fallback ? <img alt={alt} src={fallback} {...imgProps} /> : null;
  }

  return (
    <picture>
      <source type="image/avif" srcSet={picture.avif} sizes={sizes} />
      <img
        alt={alt}
        src={picture.src}
        srcSet={picture.webp}
        sizes={sizes}
        width={picture.width}
        height={picture.height}
        {...imgProps}
      />
    </picture>
  );
}
