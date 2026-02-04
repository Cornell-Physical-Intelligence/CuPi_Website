import { useEffect, useMemo } from 'react';
import ProjectPanel from '../components/ProjectPanel';
import SiteFooter from '../components/SiteFooter';
import { assetPath } from '../utils/assetPath';
import { preloadImages } from '../utils/preloadImages';
import { PROJECTS } from '../data/projects';

function WorkPage() {
  const projectImagePaths = useMemo(
    () => [
      assetPath('img/Quad.png'),
      assetPath('img/DroneFlipped.png'),
      assetPath('img/Hexapod.png'),
      assetPath('img/LegFlipped.png'),
      assetPath('img/SwallowProject.png'),
    ],
    []
  );

  useEffect(() => {
    preloadImages(projectImagePaths, { priority: 'high', decode: true });
  }, [projectImagePaths]);

  return (
    <main className="alt-page">
      <section className="alt-section">
        <h2 className="section-label">Current Projects</h2>
        <div className="project-gallery">
          {PROJECTS.map((project) => (
            <ProjectPanel key={project.key} project={project} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export default WorkPage;
