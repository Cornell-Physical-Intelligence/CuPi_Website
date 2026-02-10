import { useRef, useState } from 'react';
import { assetPath } from '../utils/assetPath';
import { PROJECT_PARTNERS } from '../data/projects';

const stopCardFlip = (event) => {
  event.stopPropagation();
};

const stopCardFlipOnKey = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.stopPropagation();
  }
};

function ProjectPartnerLinks({ partners, onHoverChange }) {
  if (!partners || partners.length === 0) {
    return null;
  }

  const isMulti = partners.length > 1;

  return (
    <div
      className={`project-panel__partners${isMulti ? ' project-panel__partners--multi' : ''}`}
      onClick={stopCardFlip}
      onKeyDown={stopCardFlipOnKey}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
    >
      {partners.map((partner) => (
        <a
          key={partner.href}
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer"
          className="project-panel__partner-link"
          aria-label={partner.alt}
          onClick={stopCardFlip}
          onKeyDown={stopCardFlipOnKey}
        >
          <img
            src={assetPath(partner.src)}
            alt={partner.alt}
            className="project-panel__partner-logo"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

function ProjectPanel({ project }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoverSide, setHoverSide] = useState(null);
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [flipDir, setFlipDir] = useState('right');
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [isLeveled, setIsLeveled] = useState(false);
  const overlayTimeoutRef = useRef(null);

  const handleToggle = () => {
    if (overlayTimeoutRef.current) {
      window.clearTimeout(overlayTimeoutRef.current);
    }
    if (!isFlipped) {
      overlayTimeoutRef.current = window.setTimeout(() => {
        setOverlayHidden(true);
      }, 50);
    } else {
      setOverlayHidden(false);
    }
    setIsFlipped((prev) => !prev);
    setFlipDir(hoverSide ?? flipDir ?? 'right');
    setHoverEnabled(false);
    setHoverSide(null);
  };

  const handlePartnerHover = (isHovering) => {
    if (isHovering) {
      setHoverSide(null);
      setHoverEnabled(false);
      setIsLeveled(true);
      return;
    }
    if (isFlipped) return;
    setHoverEnabled(true);
    setIsLeveled(false);
  };

  const handleMouseLeave = () => {
    setHoverSide(null);
    setHoverEnabled(true);
  };

  const handleMouseMove = (event) => {
    if (!hoverEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    setHoverSide((prev) => (prev === side ? prev : side));
  };

  const partners = PROJECT_PARTNERS[project.key];

  return (
    <figure
      className="project-panel"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleToggle();
        }
      }}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className={`project-panel__flipper ${flipDir === 'left' ? 'flip-left' : 'flip-right'} ${isFlipped ? 'is-flipped' : ''} ${hoverSide ? `tilt-${hoverSide}` : ''} ${isLeveled ? 'is-leveled' : ''}`}
        data-panel={project.key}
      >
        <div
          className={`project-panel__face project-panel__face--front ${project.placeholder ? 'project-panel__face--placeholder' : ''} ${overlayHidden ? 'is-overlay-hidden' : ''}`}
          data-zoom={project.frontZoom}
        >
          {project.placeholder ? (
            <span className="project-panel__placeholder">[?]</span>
          ) : project.frontImageMobile ? (
            <picture>
              <source media="(max-width: 640px)" srcSet={assetPath(project.frontImageMobile)} />
              <img src={assetPath(project.frontImage)} alt={project.frontAlt} loading="lazy" />
            </picture>
          ) : (
            <img src={assetPath(project.frontImage)} alt={project.frontAlt} loading="lazy" />
          )}
          <figcaption className="project-panel__label">{project.label}</figcaption>
          <ProjectPartnerLinks
            partners={partners}
            onHoverChange={handlePartnerHover}
          />
        </div>
        <div className="project-panel__face project-panel__face--back">
          <div className="project-panel__back-content">
            <p className="project-panel__heading">
              <span className="project-panel__heading-title">{project.backTitle}</span>
              <span className="project-panel__heading-lead">{project.backLead}</span>
            </p>
            <div className={`project-panel__details ${project.backDetailsClass || ''}`}>
              {project.backDetails}
            </div>
          </div>
          {project.backImageSplit ? (
            <div className="project-panel__back-image-split" aria-hidden="true">
              <div className="project-panel__back-image-half project-panel__back-image-half--left">
                <img src={assetPath(project.backImage)} alt="" loading="lazy" />
              </div>
              <div className="project-panel__back-image-half project-panel__back-image-half--right">
                <img src={assetPath(project.backImage)} alt="" loading="lazy" />
              </div>
            </div>
          ) : project.backImage ? (
            <img
              src={assetPath(project.backImage)}
              alt={project.backImageAlt}
              className={`project-panel__back-image ${project.backImageClass || ''}`}
              loading="lazy"
            />
          ) : null}
        </div>
      </div>
    </figure>
  );
}

export default ProjectPanel;
