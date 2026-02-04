export const APPLY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSePAs7xr7J6OrCI2z-gBEo6HAQ4Aip6ps0nbR93yQYDhYqlbQ/viewform';

export const PROJECT_PARTNERS = {
  quad: [
    {
      href: 'https://theaigrandprix.com/',
      src: 'icons/ai-gp-logo-orange.svg',
      alt: 'AI Grand Prix'
    },
    {
      href: 'https://modovolo.com/',
      src: 'icons/Modovolo_Logo.png',
      alt: 'Modovolo'
    }
  ],
  hexapod: [
    {
      href: 'https://www.touchtronix.io/',
      src: 'icons/TouchTronix_Logo.png',
      alt: 'TouchTronix'
    }
  ],
  swallow: []
};

export const PROJECTS = [
  {
    key: 'quad',
    label: 'Project 001 — Quad',
    frontImage: 'img/Quad.png',
    frontAlt: 'Project 001 Quad',
    frontZoom: 'in',
    backTitle: 'Quadcopter — A family of autonomy focused quadcopters',
    backLead: 'Lead: Andre',
    backDetails: (
      <>
        <p>
          CUPI's modular quadcopters pair efficient propulsion, onboard compute, and payload-ready hardpoints into an airframe that can jump from
          mapping flights to data-collection sorties. The large platform
          keeps future hooks for sharing sensing duties with ground robots while remaining easy to reconfigure for new research payloads.
        </p>
        <p>
          In parallel, a compact indoor drone gives the autonomy team a safe place to train <strong>AI perception</strong>. Six side-mounted cameras and full
          prop guards let it bounce around hallways while streaming vision back to our lab compute; it is not meant to dock with the larger craft,
          but to accelerate our model development before we graduate behaviors to the research airframe.
        </p>
      </>
    ),
    backImage: 'img/DroneFlipped.png',
    backImageAlt: 'Quadcopter render',
    backImageClass: 'project-panel__back-image--offset-small',
  },
  {
    key: 'hexapod',
    label: 'Project 002 — Hexapod',
    frontImage: 'img/Hexapod.png',
    frontAlt: 'Project 002 Hexapod',
    frontZoom: 'bird',
    backTitle: 'Hexapod — A highly mobile and adaptable legged robot',
    backLead: 'Lead: Alan',
    backDetails: (
      <>
        <p>
          The hexapod extends Cornell's beach-cleaning research into a <strong>bio-inspired legged system</strong>, keeping most of the mass concentrated
          near the core for efficiency. A <strong>Jetson Nano</strong> rides onboard for machine-vision inference and field autonomy so the platform can run
        </p>
        <p>
          Each 3DOF limb relies on <strong>tendon-style linkages</strong>, clustering three servos at the first joint while mechanically transmitting motion
          to the outer joints. That layout simplifies manufacturing, protects the actuators, and still gives the legs the travel they need to
          navigate uneven surfaces before handing sensor data back to the aerial systems.
        </p>
      </>
    ),
    backImage: 'img/LegFlipped.png',
    backImageAlt: 'Hexapod prototype render',
    backImageClass: 'project-panel__back-image--offset',
  },
  {
    key: 'swallow',
    label: 'Project 003 — Bore',
    placeholder: true,
    backTitle: 'Coming soon',
    backLead: 'Lead: TBA',
    backDetails: null,
    backDetailsClass: 'project-panel__details--icon-only',
  },
];
