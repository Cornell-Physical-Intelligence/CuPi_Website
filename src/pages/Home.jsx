import { useState } from 'react';
import VoronoiTitle from '../components/VoronoiTitle';
import MissionTiles from '../components/MissionTiles';
import SubteamPanel from '../components/SubteamPanel';
import Gallery from '../components/Gallery';
import SiteFooter from '../components/SiteFooter';

export default function Home({ titleApi }) {
  // Held here rather than in MissionTiles so the count-up and the stat fade-in only
  // play once per visit — remounting the section on navigation would otherwise replay it.
  const [missionTilesPlayed, setMissionTilesPlayed] = useState(false);

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__intro">
          <h1 className="hero__title">
            <span className="visually-hidden">Cornell Physical Intelligence (CUPI)</span>
            <VoronoiTitle text="CUPI" apiRef={titleApi} />
          </h1>
          <p className="hero__subtitle">(Cornell University Physical Intelligence)</p>
        </div>
      </section>

      <MissionTiles
        played={missionTilesPlayed}
        onPlay={() => setMissionTilesPlayed(true)}
      />

      <SubteamPanel />

      <Gallery />

      <SiteFooter />
    </main>
  );
}
