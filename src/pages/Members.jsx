import { useEffect, useMemo, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import { preloadImages } from '../utils/preloadImages';
import { TEAM_SECTIONS, PROFESSORS, BIO_PLACEHOLDER } from '../data/team';
import './Members.css';

// Rebuilt rather than ported. The old roster spent a 230px card and a sliding drawer on
// each person, which pushed 37 people over several screens. Here the tile is small, the
// name and role are always visible, and the bio comes up as an overlay on the portrait
// so opening one never reflows the grid.

// One photo per person for now; formal portraits will come back as a second file and a
// toggle when they are shot.
// Photos are imported rather than read from public/, so Vite fingerprints each filename
// with a content hash. Swapping someone's headshot then changes its URL, which is what
// stops browsers and the CDN serving the previous one from cache -- an unhashed
// /img/People/Jon.png is cached forever under the same name.
const PHOTOS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/people/*.webp', { eager: true, query: '?url', import: 'default' })
  ).map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url])
);

const photoFor = (member) => PHOTOS[member.imageBase] ?? PHOTOS.Placeholder;

// Role wins over class year; "First Year" reads better as "Freshman".
const metaFor = (member) => {
  if (member.role) return member.role;
  if (member.meta) return member.meta;
  if (member.year && member.year !== 'TBD') {
    return member.year === 'First Year' ? 'Freshman' : member.year;
  }
  return null;
};

function MemberCard({ member, isOpen, onToggle }) {
  const meta = metaFor(member);
  const bio = member.bio ?? BIO_PLACEHOLDER;
  const hasBio = bio !== BIO_PLACEHOLDER;

  return (
    <article className={`member ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="member__frame"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={hasBio ? `Read about ${member.name}` : member.name}
      >
        <img src={photoFor(member)} alt={member.name} loading="lazy" decoding="async" />
        <span className="member__bio">
          <span className="member__bio-text">{bio}</span>
        </span>
      </button>
      <p className="member__name">{member.name}</p>
      {meta && <p className="member__meta">{meta}</p>}
    </article>
  );
}

export default function Members() {
  const [openCard, setOpenCard] = useState(null);

  const imagePaths = useMemo(() => Object.values(PHOTOS), []);
  useEffect(() => {
    preloadImages(imagePaths, { priority: 'high', decode: true });
  }, [imagePaths]);

  // Two rules, in order: the team lead heads the roster regardless of whether a headshot
  // exists yet, then anyone still awaiting one sinks to the end of their own section so
  // the placeholders group into a block instead of speckling the grid. Keyed on the role
  // rather than a name so it survives a change of lead. The sort is stable, so everything
  // else keeps the order it has in the data.
  const sections = [...TEAM_SECTIONS, { title: 'Faculty', members: PROFESSORS }].map(
    (section) => ({
      ...section,
      members: [...section.members].sort(
        (a, b) =>
          (a.role === 'Team Lead' ? 0 : 1) - (b.role === 'Team Lead' ? 0 : 1) ||
          Number(Boolean(b.imageBase)) - Number(Boolean(a.imageBase))
      ),
    })
  );

  return (
    <main className="alt-page">
      <div className="members">
        <div className="page-head">
          <h1 className="page-title">Members</h1>
        </div>

        {sections.map((section) => (
          <section className="members__section block" key={section.title}>
            <h2 className="block-title">
              {section.title}
              <span className="block-count">{section.members.length}</span>
            </h2>
            <div className="members__grid">
              {section.members.map((member) => {
                const id = `${section.title}-${member.name}`;
                return (
                  <MemberCard
                    key={id}
                    member={member}
                    isOpen={openCard === id}
                    onToggle={() => setOpenCard((prev) => (prev === id ? null : id))}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
