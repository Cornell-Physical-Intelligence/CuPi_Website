import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CountUp from './CountUp';
import './MissionTiles.css';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: 'Members', value: 35 },
  { label: 'Subteams', value: 4 }
];

function MissionTiles({ played, onPlay }) {
  const statRefs = useRef([]);
  const blurbRef = useRef(null);

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

  // Finalize blurb box on scroll (dotted → solid, tag flash out)
  useEffect(() => {
    const el = blurbRef.current;
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
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  return (
    <section className="mission-tiles">
      <div className="mission-tiles__content">
        <div className="mission-tiles__blurb-wrapper" ref={blurbRef}>
          <p className="mission-tiles__blurb">
            At CUPI, we aim to create physical systems that can intelligently reason and
            interact with their environments. The gap between AI software and hardware
            needs to be closed seamlessly, and through our multidisciplinary team, we
            pursue this symbiosis. We prioritize creative, ambitious, and self-starting
            thinkers, because the problems worth solving here do not come with
            instructions.
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
