import React from 'react';
import { useLocation } from 'react-router-dom';
import { AssetCategory, AssetRow, getAssets } from '..';
import { ROOT_ASSETS } from '../../../config/assetCategory.config';

const AssetsContext = React.createContext<{
  assets: AssetRow[];
  refresh: () => void;
}>({ assets: [], refresh: () => {} });

export const useAssetsContext = () => React.useContext(AssetsContext);

export function AssetsContextProvider({
  category,
  children
}: {
  category: AssetCategory;
  children?: JSX.Element;
}) {
  const { pathname } = useLocation();
  const [assets, setAssets] = React.useState<AssetRow[]>([]);
  const refresh = React.useCallback(() => {
    getAssets({ type: ROOT_ASSETS.get(category) }).then(setAssets);
  }, [category]);
  React.useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  return <AssetsContext.Provider value={{ assets, refresh }}>{children}</AssetsContext.Provider>;
}
