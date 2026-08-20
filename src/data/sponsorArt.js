import { pictureFromWidthTargets } from '../utils/responsiveImage';

// Runtime source of truth for raster artwork on Sponsors. The build checks each expanded
// record against the generated manifest before production files are emitted.
export const SPONSOR_ART_PICTURES = {
  HexapodLegWireframe: pictureFromWidthTargets({
    base: '/img/HexapodLegWireframe',
    width: 1600,
    height: 453,
    targets: [800, 1600],
  }),
  CUGeoData_Logo: pictureFromWidthTargets({
    base: '/icons/CUGeoData_Logo',
    width: 985,
    height: 199,
    targets: [493, 985],
  }),
  Modovolo_Logo: pictureFromWidthTargets({
    base: '/icons/Modovolo_Logo',
    width: 500,
    height: 559,
    targets: [280, 500],
  }),
};
