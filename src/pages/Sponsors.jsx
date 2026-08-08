import { useEffect, useRef, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SponsorMark from '../components/SponsorMark';
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
  const [copied, setCopied] = useState(false);
  const resetRef = useRef(null);

  useEffect(() => () => window.clearTimeout(resetRef.current), []);

  // Clicking the address copies it rather than launching a mail client, which on most
  // machines opens something nobody uses.
  const copyContact = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT);
      } else {
        // execCommand fallback for non-secure contexts, where the Clipboard API is absent.
        const field = document.createElement('textarea');
        field.value = CONTACT;
        field.setAttribute('readonly', '');
        field.style.position = 'absolute';
        field.style.left = '-9999px';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        document.body.removeChild(field);
      }
      setCopied(true);
      window.clearTimeout(resetRef.current);
      resetRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="alt-page">
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
          <div className="page-head">
            <h1 className="page-title">Sponsors</h1>
          </div>
        </div>

        <p className="sponsors__lede">
          CUPI builds the future of human robot interaction at Cornell. Robots and compute
          are super expensive, so we are extremely grateful for our awesome sponsors! To
          become one, read the{' '}
          <a href={assetPath(PACKET)} target="_blank" rel="noreferrer">
            sponsorship packet
          </a>{' '}
          and write to{' '}
          <span className="sponsors__email-wrap">
            <button type="button" className="sponsors__email" onClick={copyContact}>
              {CONTACT}
            </button>
            <span className={`sponsors__copied ${copied ? 'is-visible' : ''}`} aria-hidden="true">
              copied!
            </span>
          </span>
          .
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
                      {/* No logo file on hand, so draw the lockup instead of dropping a
                          bare line of text into a row of logos. */}
                      {logo ? (
                        <img src={assetPath(logo)} alt={name} loading="lazy" />
                      ) : (
                        <SponsorMark name={name} />
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
