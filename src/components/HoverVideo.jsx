import { useRef, useState } from 'react';
import './HoverVideo.css';

/**
 * A still PNG that becomes a video on hover.
 *
 * The PNG is the only thing fetched on page load: the <video> carries `preload="none"`,
 * so not a byte of it moves until the pointer (or keyboard focus, or a tap) asks for it.
 * That keeps the hero paint as cheap as an image while still giving the tile motion.
 *
 * The still stays layered on top until the video's `playing` event fires, so the handover
 * is a cross-fade rather than a flash of empty <video>. Poster and clip are encoded at the
 * same dimensions, so they land on exactly the same pixels — nothing shifts when the two
 * trade places.
 *
 * `ratio` is the tile's aspect ratio (any CSS aspect-ratio value), defaulting to square.
 * Pass the source footage's own ratio to avoid `object-fit: cover` cropping content out —
 * it matters for clips with overlaid telemetry near the edges.
 */
export default function HoverVideo({ src, poster, label, ratio }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const startPlaying = () => {
    // First call is also what triggers the download — preload="none" until now.
    videoRef.current?.play().catch(() => {}); // a fast leave aborts the promise; harmless
  };

  const stopPlaying = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  };

  // Hover doesn't exist on touch, so there a tap toggles instead.
  const onPointerDown = (e) => {
    if (e.pointerType !== 'touch') return;
    if (playing) stopPlaying();
    else startPlaying();
  };

  return (
    <button
      type="button"
      className={`hover-video ${playing ? 'is-playing' : ''}`.trim()}
      style={ratio ? { '--hover-video-ratio': ratio } : undefined}
      onPointerEnter={(e) => e.pointerType !== 'touch' && startPlaying()}
      onPointerLeave={(e) => e.pointerType !== 'touch' && stopPlaying()}
      onPointerDown={onPointerDown}
      onFocus={startPlaying}
      onBlur={stopPlaying}
      aria-label={label}
    >
      <img draggable={false} className="hover-video__still" src={poster} alt="" aria-hidden="true" />
      <video
        ref={videoRef}
        className="hover-video__clip"
        src={src}
        preload="none"
        muted
        loop
        playsInline
        tabIndex={-1}
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
      />
    </button>
  );
}
