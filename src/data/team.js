export const BIO_PLACEHOLDER = '[coming soon]';

// `zoom` / `zoomShift` correct a portrait's framing, and only need setting when someone
// reads bigger or smaller than the rest of the grid. Both are optional; see ROSTER_ZOOM in
// pages/Members.jsx for what the unset default is and why it is not 1.
//   zoom      — scale on top of the object-fit: cover crop. 1 = the full frame height of
//               the source, which is as far out as these photos go.
//   zoomShift — vertical nudge in % of the tile, negative = up. For a subject who stands
//               low in frame, so zooming in does not push them lower still.

export const TEAM_SECTIONS = [
  {
    // The team lead sits at the head of Leads rather than in a section of one.
    title: 'Leads',
    members: [
      {
        name: 'Andre Boufama',
        imageBase: 'Andre',
        bio: "Hi I'm Andre. I like making websites and CAD and also eating",
        role: 'Team Lead',
        project: 'Everything'
      },
      {
        name: 'Jonathan Song',
        imageBase: 'Jon',
        bio: "I'm really passionate about integrated electronics and anything robotics. In my free time I like to play ultimate frisbee and acoustic guitar",
        role: 'Electrical Co-Lead',
        project: 'Hexapod'
      },
      {
        name: 'Mic Robbins',
        bio: "I'm an electrical engineer and like to play clash royale (15k)",
        role: 'Electrical Co-Lead',
        project: 'Quad'
      },
      {
        name: 'Alan Munschy',
        imageBase: 'Alan',
        bio: 'Hi, I like working on robot controls and I play chess',
        role: 'Mech Co-Lead',
        project: 'Hexapod'
      },
      {
        name: 'Ollie Aizer',
        bio: 'Hi, my name is Ollie and I like drone design and cooking.',
        role: 'Mech Co-Lead',
        project: 'Quad'
      },
      {
        name: 'James Cenawood',
        imageBase: 'James',
        bio: BIO_PLACEHOLDER,
        role: 'Computer Science Co-Lead',
        project: 'Quad'
      },
      {
        name: 'Nicholas Letendre',
        imageBase: 'NickLet',
        bio: "I'm Nicholas, and I study mechanical and aerospace engineering. I'm interested in programming for robotics and games.",
        role: 'Computer Science Co-Lead',
        year: 'Junior',
        project: 'Hexapod'
      },
      {
        name: 'Max Lee',
        bio: BIO_PLACEHOLDER,
        role: 'Operations Co-Lead',
        project: 'Business'
      },
      {
        name: 'Aidan Moran',
        imageBase: 'Aidan',
        bio: BIO_PLACEHOLDER,
        role: 'Operations Co-Lead',
        year: 'Sophomore',
        project: 'Business'
      },
      {
        name: 'Sophie Di',
        imageBase: 'Sophie',
        bio: "I'm a mechanical engineer and I love sketching, bouldering, and throwing paper airplanes",
        role: 'Creative Lead',
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Youhanna Meleka',
        bio: BIO_PLACEHOLDER,
        role: 'Technical Project Manager'
      }
    ]
  },
  {
    title: 'Members',
    members: [
      {
        name: 'Nigel Tatem',
        imageBase: 'Nigel',
        zoom: 1.52,
        // He stands furthest from the camera, so the zoom that matches his head to everyone
        // else's also drags him down the frame (it scales from the top edge). This lifts him
        // back so his crown lands level with the rest of the grid.
        zoomShift: -18,
        bio: BIO_PLACEHOLDER,
        year: 'Junior'
      },
      {
        name: 'Nathan Cunningham',
        imageBase: 'Nathan',
        zoom: 1,
        bio: "I'm interested in developing embedded systems. I enjoy running and eating",
        year: 'Freshman',
        project: 'Hexapod'
      },
      {
        name: 'Josh Lennon',
        imageBase: 'JoshLennon',
        bio: BIO_PLACEHOLDER,
        year: 'Junior',
        project: 'Quad'
      },
      {
        name: 'Nick Lennon',
        imageBase: 'NickLennon',
        bio: 'Hey, my name is Nick Lennon and I am interested in software, firmware, modeling, team coordination, and spicy food!',
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Ronan Alo',
        imageBase: 'Ronan',
        zoom: 1,
        bio: 'I am majoring in mechanical engineering and computer science, interested in drone pathing',
        year: 'Junior',
        project: 'Quad'
      },
      {
        name: 'Amanuel Adane',
        imageBase: 'Amanuel',
        zoom: 1,
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Raymond Sheng',
        imageBase: 'Raymond',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Pratyush Saxena',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Shaurya Sen',
        imageBase: 'Shaurya',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore'
      },
      {
        name: 'Jonathan Bael',
        imageBase: 'JonBael',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Ty Yue',
        imageBase: 'Ty',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Mouhammad Dia',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore'
      },
      {
        name: 'Ruichen Bao',
        imageBase: 'Ruichen',
        bio: BIO_PLACEHOLDER,
        meta: 'Graduate Student'
      },
      {
        name: 'Alicia He',
        imageBase: 'Alicia',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Mina Yeh',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Vincent Yi',
        imageBase: 'Vincent',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore'
      },
      {
        name: 'Calvin Pang',
        imageBase: 'Calvin',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore'
      },
      {
        name: 'Suphia Zhang',
        imageBase: 'Suphia',
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Claire Shi',
        imageBase: 'Claire',
        zoom: 1,
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
      {
        name: 'Cam Hogan',
        imageBase: 'Cam',
        bio: BIO_PLACEHOLDER,
        meta: 'Graduate Student'
      },
      {
        name: 'Julian Gasharov',
        imageBase: 'Julian',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore'
      },
      {
        name: 'Anant Gupta',
        imageBase: 'Anant',
        zoom: 1,
        bio: BIO_PLACEHOLDER,
        year: 'Freshman'
      },
    ]
  }
];

export const PROFESSORS = [
  {
    name: 'Prof. Jake Welde',
    imageBase: 'ProfWelde',
    zoom: 1,
    bio: 'He has worked extensively in drone control systems',
    role: 'Faculty'
  },
  {
    name: 'Prof. Jingjie Yeo',
    imageBase: 'ProfYeo',
    zoom: 1,
    bio: 'Joined Cornell in 2020 after research in Singapore and postdocs at Tufts & MIT.',
    role: 'Faculty'
  }
];
