import { useState } from 'react';
import { assetPath } from '../utils/assetPath';
import { BIO_PLACEHOLDER } from '../data/team';

const getMemberImage = (member, formalMode) => {
  const base = member.imageBase;
  if (!base) {
    return assetPath('img/People/Placeholder.png');
  }
  const suffix = formalMode ? member.formalSuffix ?? '_suit' : '';
  return assetPath(`img/People/${base}${suffix}.png`);
};

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const getMemberMeta = (member) => {
  if (member.role) return member.role;
  if (member.meta) return member.meta;
  const year =
    member.year && member.year !== 'TBD'
      ? member.year === 'First Year'
        ? 'Freshman'
        : member.year
      : null;
  if (year) return year;
  return 'Year TBD';
};

function TeamCard({ member, formalMode, isFlipped, onToggle, onClear }) {
  const [tiltSide, setTiltSide] = useState(null);
  const photoSrc = getMemberImage(member, formalMode);
  const bio = member.bio ?? BIO_PLACEHOLDER;
  const isPlaceholderBio = bio === BIO_PLACEHOLDER;
  const meta = getMemberMeta(member);

  const handleMouseMove = (event) => {
    if (isFlipped) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    setTiltSide((prev) => (prev === side ? prev : side));
  };

  const handleClick = () => {
    setTiltSide(null);
    onToggle();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTiltSide(null);
      onClear();
    }
  };

  return (
    <article
      className={`team-card ${isFlipped ? 'is-flipped' : ''} ${tiltSide ? `tilt-${tiltSide}` : ''}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTiltSide(null)}
      onBlur={handleBlur}
    >
      <div className="team-card__flipper">
        <div className="team-card__face team-card__face--front">
          <div className="team-card__photo">
            {photoSrc ? (
              <img src={photoSrc} alt={member.name} loading="lazy" />
            ) : (
              <span className="team-card__photo-placeholder">{getInitials(member.name)}</span>
            )}
          </div>
          <div className="team-card__body">
            <p className="team-card__name">{member.name}</p>
            <p className="team-card__meta">{meta}</p>
          </div>
        </div>
        <div className="team-card__face team-card__face--back">
          <p className={`team-card__bio ${isPlaceholderBio ? 'team-card__bio--placeholder' : ''}`}>
            {bio}
          </p>
        </div>
      </div>
    </article>
  );
}

export default TeamCard;
