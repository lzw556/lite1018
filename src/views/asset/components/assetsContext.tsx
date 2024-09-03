import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppConfigType,
  AssertAssetCategory,
  AssertOfAssetCategory,
  AssetRow,
  getAssets,
  useAppConfigContext
} from '..';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';

const AssetsContext = React.createContext<{
  assets: AssetRow[];
  refresh: () => void;
}>({ assets: [], refresh: () => {} });

export const useAssetsContext = () => React.useContext(AssetsContext);

export function AssetsContextProvider({ children }: { children?: JSX.Element }) {
  const { pathname } = useLocation();
  const [assets, setAssets] = React.useState<AssetRow[]>([]);
  const config = useAppConfigContext();
  const { root } = useAssetCategoryChain();
  const refresh = React.useCallback(() => {
    getAssets(root?.key ? { type: root.key, parent_id: 0 } : { parent_id: 0 }).then((assets) =>
      setAssets(filterVibrationAssets(assets, config.type))
    );
  }, [root?.key, config.type]);
  React.useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  return <AssetsContext.Provider value={{ assets, refresh }}>{children}</AssetsContext.Provider>;
}

function filterVibrationAssets(assets: AssetRow[], type: AppConfigType) {
  return assets.filter((a) =>
    type === 'vibration' ? AssertAssetCategory(a.type, AssertOfAssetCategory.IS_VIBRATION) : true
  );
}
