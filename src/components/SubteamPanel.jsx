import { useCallback, useEffect, useRef, useState } from 'react';
import { SUBTEAMS } from '../data/subteams';
import './SubteamPanel.css';

// Lifted out of the old HomePage, which inlined this markup. The panel starts as a
// dotted "unfinished" box with a debug tag and resolves to a solid outline ~0.8s after
// it first scrolls into view; each subteam's project list is an accordion.
export default function SubteamPanel() {
  const [expandedTeams, setExpandedTeams] = useState(() => new Set());
  const panelRef = useRef(null);

  const toggleTeam = useCallback((title) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            el.classList.add('is-finalized');
          }, 800);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  return (
    <section className="subteam-section">
      <article className="subteam-panel subteam-panel--stacked" ref={panelRef}>
        <div className="subteam-panel__inner">
          {SUBTEAMS.map((team) => {
            const isExpanded = expandedTeams.has(team.title);
            return (
              <div className="subteam-panel__blurb" key={team.title}>
                <div
                  className="subteam-panel__header"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleTeam(team.title)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTeam(team.title);
                    }
                  }}
                >
                  <h3 className="subteam-panel__title">{team.title}</h3>
                  <span className={`subteam-panel__toggle ${isExpanded ? 'is-expanded' : ''}`}>
                    {isExpanded ? '[−]' : '[+]'}
                  </span>
                </div>
                <p className="subteam-panel__desc">{team.description}</p>
                <div className={`subteam-panel__items-wrap ${isExpanded ? 'is-expanded' : ''}`}>
                  <div>
                    {team.items && team.items.length > 0 && (
                      <div className="subteam-panel__items">
                        <p className="subteam-panel__items-label">{team.label}</p>
                        <ul className="subteam-panel__items-list">
                          {team.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
