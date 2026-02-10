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
    label: 'Project 001: Symbiote',
    frontImage: 'img/WorkPage/SymbioteOrtho.png',
    frontImageMobile: 'img/WorkPage/SymbioteOrthoMobile.png',
    frontAlt: 'Project 001 Symbiote',
    frontZoom: 'in',
    backTitle: 'Symbiote: Coordinated UAV & UGV for autonomous research',
    backLead: 'Leads: Andre & Alan',
    backDetails: (
      <>
        <p>
          In nature, species like oxpeckers and rhinos thrive by pairing complementary abilities.
          One sees far, the other moves through anything. Symbiote brings that principle
          to robotics:
        </p>
        <ul>
          <li>A <mark>quadcopter</mark> (UAV) and a <mark>hexapod</mark> (UGV) that share perception
            and coordinate autonomously for research and surveying missions</li>
          <li>The quadcopter handles aerial mapping and wide-area sensing</li>
          <li>The hexapod navigates rough terrain for close-range data collection</li>
        </ul>
        <br />
        <p>
          The two platforms communicate over ESP-NOW via custom ESP32 PCBs, fusing
          sensor data in real time and dividing tasks the way a symbiotic pair would in the wild.
        </p>
        <ul>
          <li>Real-time sensor fusion between air and ground platforms</li>
          <li>All custom-designed PCBs for onboard compute and communication</li>
        </ul>
        <br />
        <p>
          As a side project, our autonomy team is competing in
          the <mark>AI Grand Prix</mark>, a global autonomous drone-racing competition by Anduril,
          to sharpen perception and control skills that feed directly back into Symbiote.
        </p>
        <ul>
          <li>$500K prize pool, AI-piloted drones racing through dynamic courses</li>
        </ul>
      </>
    ),
  },
  {
    key: 'swallow',
    label: 'Project 002: Bore',
    placeholder: true,
    backTitle: 'Coming soon',
    backLead: 'Lead: TBA',
    backDetails: null,
    backDetailsClass: 'project-panel__details--icon-only',
  },
];
