import { pictureFromWidthTargets } from '../utils/responsiveImage';

// Runtime source of truth for Apply's one picture. vite.config.js validates the expanded
// record against the generated asset manifest, so a recut master or target-list change
// cannot leave these descriptors pointing at the wrong files.
export const APPLY_ART_PICTURES = {
  CrabOnBeach: pictureFromWidthTargets({
    base: '/img/CrabOnBeach',
    width: 1257,
    height: 892,
    targets: [380, 760],
  }),
};
