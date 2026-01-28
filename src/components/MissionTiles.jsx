import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CountUp from './CountUp';
import './MissionTiles.css';
import { assetPath } from '../utils/assetPath';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: 'Members', value: 17 },
  { label: 'Subteams', value: 4 }
];

function MissionTiles({ played, onPlay }) {
  const statRefs = useRef([]);

  useEffect(() => {
    if (played) {
      statRefs.current.forEach(el => {
        if (el) {
          gsap.set(el, { opacity: 1, y: 0 });
        }
      });
      return;
    }

    const elements = statRefs.current;
    const animations = elements.map((el) => {
      if (!el) return null;

      return gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom-=15%',
            once: true,
            onEnter: () => onPlay && onPlay()
          }
        }
      );
    });

    return () => {
      animations.forEach((animation) => animation?.kill());
    };
  }, [played, onPlay]);

  return (
    <section className="mission-tiles">
      <div className="mission-tiles__background" aria-hidden="true">
        <img
          src={assetPath('img/LegRender.png')}
          alt=""
          loading="lazy"
          className="mission-tiles__background-img"
        />
      </div>
      <div className="mission-tiles__content">
        <div className="mission-tiles__blurb-wrapper">
          <p className="mission-tiles__blurb">
            At CUPI, we believe advanced engineering solutions already exist in nature. Through
            millions of years of evolution, natural systems have mastered adaptability and
            efficiency. These are the very same principles that guide our design process. By
            analyzing biological structures and systems, we can create new mechanical systems
            that combine convention with innovation. Our team is made up of students from various
            disciplines at Cornell, united by a common vision: to engineer with inspiration and
            creativity, building machines that can function autonomously and meet ever-advancing
            goals.
          </p>
        </div>
        <div className="mission-tiles__stats" aria-label="Team scale insights">
          {stats.map((stat, index) => (
            <div
              className="mission-stat"
              key={stat.label}
              ref={(el) => {
                statRefs.current[index] = el;
              }}
            >
              <CountUp
                from={0}
                to={stat.value}
                separator=","
                direction="up"
                duration={1.5}
                className="mission-stat__value"
              />
              <span className="mission-stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MissionTiles;
