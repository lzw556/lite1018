import { getProject } from '../../utils/session';

export const ASSET_PATHNAME = 'assets';

export const getVirturalAsset = () => {
  const root = {
    id: 0,
    type: 0,
    name: getProject().name
  };
  const homePathId = `${root.id}-${root.type}`;
  return { root, homePathId };
};
