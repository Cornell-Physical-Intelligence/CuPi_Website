import SiteFooter from '../components/SiteFooter';
import { assetPath } from '../utils/assetPath';
import './Sponsors.css';

// Display order, top to bottom. Every tier shows whether or not it has sponsors yet.
const TIERS = [
  { key: 'gold', label: 'Gold' },
  { key: 'silver', label: 'Silver' },
  { key: 'bronze', label: 'Bronze' },
];

const SPONSORS = [
  { name: 'CU GeoData', tier: 'gold', logo: 'icons/CUGeoData_Logo.png' },
  { name: 'Tantalus', tier: 'bronze' },
];

const PACKET = 'docs/cupi-sponsorship-packet.pdf';
const CONTACT = 'ab3233@cornell.edu';

export default function Sponsors() {
  return (
    <main className="alt-page alt-page--sponsors">
      <div className="sponsors">
        {/* The wireframe is cropped at its base, so aligning that cut edge with the
            rule makes the leg read as rising out from behind the line. */}
        <div className="sponsors__masthead">
          <img
            className="sponsors__art"
            src={assetPath('img/HexapodLegWireframe.png')}
            alt=""
            aria-hidden="true"
          />
          <header className="sponsors__head">
            <h1 className="page-title">Sponsors</h1>
          </header>
        </div>

        <div className="sponsors__rule" />

        <p className="sponsors__lede">
          CUPI builds the future of human robot interaction at Cornell. Robots and compute
          are super expensive, so we are extremely grateful for our awesome sponsors! To
          become one, read the{' '}
          <a href={assetPath(PACKET)} target="_blank" rel="noreferrer">
            sponsorship packet
          </a>{' '}
          and write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>

        {TIERS.map(({ key, label }) => {
          const members = SPONSORS.filter((s) => s.tier === key);
          return (
            <section className="tier" key={key}>
              <h2 className={`tier__name tier__name--${key}`}>{label}</h2>
              {members.length > 0 && (
                <ul className="tier__list">
                  {members.map(({ name, logo }) => (
                    <li className="tier__sponsor" key={name}>
                      {logo ? (
                        <img src={assetPath(logo)} alt={name} loading="lazy" />
                      ) : (
                        <span className="tier__sponsor-name">{name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

      </div>

      <SiteFooter />
    </main>
  );
}
