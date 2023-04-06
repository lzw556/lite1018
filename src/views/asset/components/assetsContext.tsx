import React from 'react';
import { useLocation } from 'react-router-dom';
import { AssetRow, getAssets } from '..';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';

const AssetsContext = React.createContext<{
  assets: AssetRow[];
  refresh: () => void;
}>({ assets: [], refresh: () => {} });

export const useAssetsContext = () => React.useContext(AssetsContext);

export function AssetsContextProvider({ children }: { children?: JSX.Element }) {
  const { pathname } = useLocation();
  const [assets, setAssets] = React.useState<AssetRow[]>([]);

  const { root } = useAssetCategoryChain();
  const refresh = React.useCallback(() => {
    getAssets({ type: root.key, parent_id: 0 }).then(setAssets);
  }, [root.key]);
  React.useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  return <AssetsContext.Provider value={{ assets, refresh }}>{children}</AssetsContext.Provider>;
}
