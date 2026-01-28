import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { assetPath } from '../utils/assetPath';
import './SubteamShowcase.css';

gsap.registerPlugin(ScrollTrigger);

// Confirmed alignment values
const NOSE_CONE_OFFSET = { x: 1.06, y: -349, scale: 0.333 };
const PCB_OFFSET = { x: 0, y: -130, scale: 0.35 };
const TOOLTIP_OFFSETS = {
    design: { x: -226, y: -136 },
    electronics: { x: -125, y: -212 },
    software: { x: -210, y: -177 },
};

const SUBTEAMS = [
    {
        id: 'design',
        title: 'Design',
        description: 'Advanced aerodynamics, CAD modeling, and structural engineering. We optimize flight efficiency and lift-to-drag ratios through simulation, carbon fiber layups, and precision weight distribution.'
    },
    {
        id: 'electronics',
        title: 'Electronics',
        description: 'Custom PCB design, power delivery, and real-time sensor integration. Our telemetry hardware monitors battery health, motor RPM, and environmental data for reliable flight avionics.'
    },
    {
        id: 'software',
        title: 'Computer Science',
        description: 'Autonomous navigation, real-time pathfinding, and embedded AI. We use neural networks and sensor fusion for obstacle avoidance, multi-agent coordination, and split-second decision-making.'
    },
];

function SubteamShowcase() {
    const containerRef = useRef(null);
    const planeAssemblyRef = useRef(null);
    const planeTopRef = useRef(null);
    const planeBottomRef = useRef(null);
    const pcbRef = useRef(null);
    const pathLeftRef = useRef(null);
    const pathMiddleRef = useRef(null);
    const pathRightRef = useRef(null);
    const tooltipRefs = useRef([]);

    useEffect(() => {
        // Animation logic
        const container = containerRef.current;
        const planeTop = planeTopRef.current;
        const planeBottom = planeBottomRef.current;
        const pcb = pcbRef.current;
        const tooltips = tooltipRefs.current;
        const paths = [pathLeftRef.current, pathMiddleRef.current, pathRightRef.current];

        if (!container || !planeTop || !planeBottom || !pcb || !planeAssemblyRef.current || !paths[0]) return;

        const planeAssembly = planeAssemblyRef.current;

        // Initial setups
        gsap.set(planeTop, { x: NOSE_CONE_OFFSET.x, y: NOSE_CONE_OFFSET.y, scale: NOSE_CONE_OFFSET.scale * 1.5 });
        gsap.set(planeBottom, { scale: 1.5 });
        gsap.set(pcb, { x: PCB_OFFSET.x, y: PCB_OFFSET.y, scale: 1.5 * 0.56, opacity: 1 });

        gsap.set(tooltips[0], { x: TOOLTIP_OFFSETS.design.x, y: TOOLTIP_OFFSETS.design.y + 20 });
        gsap.set(tooltips[1], { x: TOOLTIP_OFFSETS.electronics.x, y: TOOLTIP_OFFSETS.electronics.y + 20 });
        gsap.set(tooltips[2], { x: TOOLTIP_OFFSETS.software.x, y: TOOLTIP_OFFSETS.software.y + 20 });

        paths.forEach(path => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top 15%',
                end: '+=700%', // Massive distance to allow takeoff into blackness
                pin: true,
                scrub: 2,
                anticipatePin: 1,
            },
        });

        // Phase 1: Design (0.0 - 0.15)
        tl.to(tooltips[0], { opacity: 1, y: TOOLTIP_OFFSETS.design.y, duration: 0.1 }, 0)
            .to(tooltips[0], { opacity: 0, duration: 0.05 }, 0.15);

        // Phase 2: Electronics (Explosion) (0.2 - 0.45)
        tl.to(planeTop, { y: NOSE_CONE_OFFSET.y - 300, scale: NOSE_CONE_OFFSET.scale * 1.5 * 3, duration: 0.25 }, 0.2)
            .to(planeBottom, { y: '50%', scale: 1.5 * 3, duration: 0.25 }, 0.2)
            .to(pcb, { scale: 1.5 * 3 * 0.56, duration: 0.25 }, 0.2)
            .to(tooltips[1], { opacity: 1, y: TOOLTIP_OFFSETS.electronics.y, duration: 0.08 }, 0.35)
            .to(tooltips[1], { opacity: 0, duration: 0.08 }, 0.45);

        // Reassembly (0.5 - 0.65)
        tl.to(planeTop, { y: NOSE_CONE_OFFSET.y, scale: NOSE_CONE_OFFSET.scale * 1.5, duration: 0.2 }, 0.5)
            .to(planeBottom, { y: '0%', scale: 1.5, duration: 0.2 }, 0.5)
            .to(pcb, { scale: 1.5 * 0.56, duration: 0.2 }, 0.5);

        // Phase 3: Computer Science
        // Zoom out plane (0.65 - 0.75)
        tl.to(pcb, { opacity: 0, duration: 0.1 }, 0.65)
            .to(planeAssembly, { scale: 0.4, duration: 0.15 }, 0.68);

        // CS Tooltip fade in - appears as plane shrinks down
        tl.to(tooltips[2], { opacity: 1, y: TOOLTIP_OFFSETS.software.y, duration: 0.05 }, 0.70);

        // AI Thinking Logic (0.83 - 0.94)
        // 1. Left Path
        tl.to(paths[0], { opacity: 1, duration: 0.01 }, 0.83)
            .to(paths[0], { strokeDashoffset: 0, duration: 0.03 }, 0.83)
            .to(paths[0], { opacity: 0, duration: 0.01 }, 0.87);

        // 2. Right Path
        tl.to(paths[2], { opacity: 1, duration: 0.01 }, 0.88)
            .to(paths[2], { strokeDashoffset: 0, duration: 0.03 }, 0.88)
            .to(paths[2], { opacity: 0, duration: 0.01 }, 0.92);

        // 3. Choice: Middle Path (Final Selection)
        tl.to(paths[1], { opacity: 1, duration: 0.01 }, 0.93)
            .to(paths[1], { strokeDashoffset: 0, duration: 0.03 }, 0.93)
            .to(paths[1], { strokeWidth: 12, duration: 0.02 }, 0.95); // Much thicker selection!

        // TAKE OFF (0.97 - 1.0)
        // Plane flies UP off screen, path and CS tooltip follow at the same rate
        tl.to(planeAssembly, { y: -3000, duration: 0.1, ease: 'expo.in' }, 0.97)
            .to(paths[1], { y: -3000, duration: 0.1, ease: 'expo.in' }, 0.97)
            .to(tooltips[2], { y: -3000, duration: 0.1, ease: 'expo.in' }, 0.97);

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach((st) => st.kill());
        };
    }, []);

    return (
        <section className="subteam-showcase" ref={containerRef}>
            <div className="subteam-showcase__content">
                <div ref={planeAssemblyRef} className="subteam-showcase__plane-assembly">
                    <img
                        ref={pcbRef}
                        src={assetPath('img/PCBModule.png')}
                        alt="PCB"
                        className="subteam-showcase__pcb"
                    />
                    <img ref={planeBottomRef} src={assetPath('img/PlaneBottom.png')} alt="Wings" className="subteam-showcase__plane subteam-showcase__plane--bottom" />
                    <img
                        ref={planeTopRef}
                        src={assetPath('img/PlaneNoseCone.png')}
                        alt="Nose"
                        className="subteam-showcase__plane subteam-showcase__plane--top"
                    />
                </div>

                <svg className="subteam-showcase__pathfinding" viewBox="0 0 1600 800" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="fadeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="white" stopOpacity="1" />
                            <stop offset="60%" stopColor="white" stopOpacity="1" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        <mask id="pathMask">
                            <rect x="-400" y="-800" width="2400" height="2000" fill="url(#fadeGradient)" />
                        </mask>
                    </defs>

                    <g mask="url(#pathMask)">
                        {/* Start point moved up 150px from y=200 to y=50 */}
                        <path ref={pathLeftRef} d="M 800 50 Q 800 -150 425 -450" fill="none" stroke="white" strokeWidth="4" strokeDasharray="8 6" className="subteam-showcase__path" />
                        <path ref={pathMiddleRef} d="M 800 50 L 800 -550" fill="none" stroke="white" strokeWidth="4" strokeDasharray="8 6" className="subteam-showcase__path" />
                        <path ref={pathRightRef} d="M 800 50 Q 800 -150 1175 -450" fill="none" stroke="white" strokeWidth="4" strokeDasharray="8 6" className="subteam-showcase__path" />
                    </g>
                </svg>

                {SUBTEAMS.map((team, index) => (
                    <div
                        key={team.id}
                        ref={(el) => { tooltipRefs.current[index] = el; }}
                        className={`subteam-showcase__tooltip subteam-showcase__tooltip--${team.id}`}
                    >
                        <span className="subteam-showcase__tooltip-title">{team.title}</span>
                        <span className="subteam-showcase__tooltip-desc">{team.description}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default SubteamShowcase;
