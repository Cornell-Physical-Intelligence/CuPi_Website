import { assetPath } from '../utils/assetPath';

export const BIO_PLACEHOLDER = '[coming soon]';

export const TEAM_SECTIONS = [
  {
    title: 'Team Lead',
    members: [
      {
        name: 'Andre Boufama',
        imageBase: 'Andre',
        bio: "Hi I'm Andre. I like making websites and CAD and also eating",
        role: 'Team Lead',
        project: 'Everything'
      }
    ]
  },
  {
    title: 'Leads',
    members: [
      {
        name: 'Jonathan Song',
        imageBase: 'Jon',
        bio: "I'm really passionate about integrated electronics and anything robotics. In my free time I like to play ultimate frisbee and acoustic guitar",
        role: 'Electrical Co-Lead',
        project: 'Hexapod'
      },
      {
        name: 'Mic Robbins',
        imageBase: 'Mic',
        bio: "I'm a sophomore electrical engineer and like to play clash royale (15k)",
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
        imageBase: 'Ollie',
        bio: 'Hi, my name is Ollie and I like drone design and cooking.',
        role: 'Mech Co-Lead',
        project: 'Quad'
      },
      {
        name: 'James Cenawood',
        bio: BIO_PLACEHOLDER,
        role: 'Computer Science Lead',
        project: 'Quad'
      },
      {
        name: 'Max Lee',
        bio: BIO_PLACEHOLDER,
        role: 'Operations Lead',
        project: 'Business'
      }
    ]
  },
  {
    title: 'Members',
    members: [
      {
        name: 'Nathan Cunningham',
        imageBase: 'Nathan',
        formalSuffix: 'Suit',
        bio: "I'm interested in developing embedded systems. I enjoy running and eating",
        project: 'Hexapod'
      },
      {
        name: 'Sophie',
        imageBase: 'Sophie',
        formalSuffix: 'Suit',
        bio: BIO_PLACEHOLDER
      },
      {
        name: 'Aidan Moran',
        bio: BIO_PLACEHOLDER,
        project: 'Business'
      },
      {
        name: 'Josh Lennon',
        bio: BIO_PLACEHOLDER,
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Sophie Di',
        bio: "I'm a mechanical engineer and I love sketching, bouldering, and throwing paper airplanes",
        year: 'Freshman',
        project: 'Quad'
      },
      {
        name: 'Nicholas Letendre',
        imageBase: 'NickLet',
        bio: "I'm Nicholas, and I am a sophomore studying mechanical and aerospace engineering. I'm interested in programming for robotics and games.",
        year: 'Sophomore',
        project: 'Hexapod'
      },
      {
        name: 'Lindsay Kossoff',
        imageBase: 'Lindsay',
        bio: 'Hi, my name is Lindsay Kossoff. I am a freshman from Maryland studying mechanical engineering.',
        year: 'Freshman',
        project: 'Quad'
      },
      {
        name: 'Christopher Guillen-Chacon',
        imageBase: 'Chris',
        bio: "My name is Chris and I'm interested in drone design",
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Nick Lennon',
        imageBase: 'NickLen',
        bio: 'Hey, my name is Nick Lennon and I am interested in software, firmware, modeling, team coordination, and spicy food!',
        year: 'Junior',
        project: 'Quad'
      },
      {
        name: 'Ronan Alo',
        imageBase: 'Ronan',
        bio: 'I am a sophomore majoring in mechanical engineering and computer science, interested in drone pathing',
        year: 'Sophomore',
        project: 'Quad'
      },
      {
        name: 'Hamilton Jeong',
        imageBase: 'Hamilton',
        bio: "I'm a BioStats major, I like competing in Taekwondo and playing piano",
        year: 'Junior',
        project: 'Quad'
      },
    ]
  }
];

export const PROFESSORS = [
  {
    name: 'Prof. Jake Welde',
    imageBase: 'ProfWelde',
    formalSuffix: '_suit',
    bio: 'He has worked extensively in drone control systems',
    role: 'Faculty'
  },
  {
    name: 'Prof. Jingjie Yeo',
    imageBase: 'ProfYeo',
    formalSuffix: '_Suit',
    bio: 'Joined Cornell in 2020 after research in Singapore and postdocs at Tufts & MIT.',
    role: 'Faculty'
  }
];

export const getAboutImagePaths = () => {
  const paths = new Set();

  const addMemberImages = (member) => {
    if (!member.imageBase) return;
    const base = member.imageBase;
    const formalSuffix = member.formalSuffix ?? '_suit';
    paths.add(assetPath(`img/People/${base}.png`));
    paths.add(assetPath(`img/People/${base}${formalSuffix}.png`));
  };

  TEAM_SECTIONS.forEach(({ members }) => members.forEach(addMemberImages));
  PROFESSORS.forEach(addMemberImages);
  paths.add(assetPath('img/People/Placeholder.png'));

  return Array.from(paths);
};
