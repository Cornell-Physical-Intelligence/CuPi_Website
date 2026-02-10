export const APPLY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSePAs7xr7J6OrCI2z-gBEo6HAQ4Aip6ps0nbR93yQYDhYqlbQ/viewform';

export const PROJECT_PARTNERS = {
  symbiote: [
    {
      href: 'https://theaigrandprix.com/',
      src: 'icons/ai-gp-logo-orange.svg',
      alt: 'AI Grand Prix'
    },
    {
      href: 'https://modovolo.com/',
      src: 'icons/Modovolo_Logo.png',
      alt: 'Modovolo'
    },
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
    key: 'symbiote',
    label: 'Project 001 — Symbiote',
    frontImage: 'img/WorkPage/SymbioteOrtho.png',
    frontAlt: 'Project 001 Symbiote',
    frontZoom: 'in',
    backTitle: 'Symbiote — Coordinated UAV & UGV for autonomous research',
    backLead: 'Leads: Andre & Alan',
    backDetails: (
      <>
        <p>
          In nature, species like oxpeckers and rhinos thrive by pairing complementary abilities — one sees far, the other moves through
          anything. <strong>Symbiote</strong> brings that principle to robotics: a modular quadcopter (UAV) and a bio-inspired hexapod (UGV) that
          share perception and coordinate autonomously for research and surveying missions.
        </p>
        <p>
          The quadcopter handles aerial mapping and wide-area sensing while the hexapod navigates rough terrain for close-range data
          collection. The two platforms communicate over <strong>ESP-NOW via custom ESP32 PCBs</strong>, fusing sensor data in
          real time and dividing tasks the way a symbiotic pair would in the wild. As a side project, our autonomy team is
          competing in the <strong>AI Grand Prix</strong> — a global autonomous drone-racing competition by Anduril — to
          sharpen perception and control skills that feed directly back into Symbiote.
        </p>
      </>
    ),
  },
  {
    key: 'swallow',
    label: 'Project 002 — Bore',
    placeholder: true,
    backTitle: 'Coming soon',
    backLead: 'Lead: TBA',
    backDetails: null,
    backDetailsClass: 'project-panel__details--icon-only',
  },
];
