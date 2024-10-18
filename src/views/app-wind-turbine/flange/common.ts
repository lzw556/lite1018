import { AssetRow } from '../../asset-common';

export function isFlangePreloadCalculation(flange?: AssetRow) {
  return flange?.attributes?.sub_type === 1;
}
export const categories = [
  { label: 'TOWER', value: 1 },
  { label: 'BLADE', value: 2 },
  { label: 'HUB_AND_NACELLE', value: 3 },
  { label: 'PITCH_BEARING', value: 4 }
];
