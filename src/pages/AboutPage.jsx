import { useEffect, useMemo, useState } from 'react';
import TeamCard from '../components/TeamCard';
import SiteFooter from '../components/SiteFooter';
import { preloadImages } from '../utils/preloadImages';
import { TEAM_SECTIONS, PROFESSORS, getAboutImagePaths } from '../data/team';

function AboutPage() {
  const [formalMode, setFormalMode] = useState(true);
  const [activeBioCard, setActiveBioCard] = useState(null);

  const aboutImagePaths = useMemo(() => getAboutImagePaths(), []);

  useEffect(() => {
    preloadImages(aboutImagePaths, { priority: 'high', decode: true });
  }, [aboutImagePaths]);

  const renderTeamGrid = (members, sectionTitle) =>
    members.map((member) => {
      const cardId = `${sectionTitle}-${member.name}`;
      return (
        <TeamCard
          key={member.name}
          member={member}
          formalMode={formalMode}
          isExpanded={activeBioCard === cardId}
          onToggle={() => setActiveBioCard((prev) => (prev === cardId ? null : cardId))}
          onClear={() => setActiveBioCard((prev) => (prev === cardId ? null : prev))}
        />
      );
    });

  return (
    <main className="alt-page">
      <section className="alt-section alt-section--team">
        <div className="alt-section__title-row">
          <h2 className="alt-section__title">Our Team</h2>
          <label className={`formal-toggle ${formalMode ? 'formal-toggle--active' : ''}`}>
            <input
              type="checkbox"
              checked={formalMode}
              onChange={() => setFormalMode((prev) => !prev)}
              aria-label="Toggle formal portraits"
            />
            <span className="formal-toggle__track">
              <span className="formal-toggle__thumb" />
            </span>
            <span className="formal-toggle__text">Formal Mode</span>
          </label>
        </div>
        <div className="team-sections">
          {TEAM_SECTIONS.map((section) => (
            <div className="team-section" key={section.title}>
              <div className="team-section__header">
                <h3>{section.title}</h3>
              </div>
              <div className="team-grid">
                {renderTeamGrid(section.members, section.title)}
              </div>
            </div>
          ))}
          <div className="team-section team-section--professors">
            <div className="team-section__header">
              <h3>Faculty</h3>
            </div>
            <div className="team-grid team-grid--professors">
              {renderTeamGrid(PROFESSORS, 'Faculty')}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export default AboutPage;
