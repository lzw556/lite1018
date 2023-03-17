import { Spin } from 'antd';
import React from 'react';
import request from '../../../utils/request';

export const ASSET_CATEGORY = {
  windTurbine: 'wind-turbines',
  general: 'generals',
  hydroTurbine: 'hydro-turbines'
};

export type AssetCategory = keyof typeof ASSET_CATEGORY;

const AssetCategoryContext = React.createContext<AssetCategory>('windTurbine');

export const useAssetCategoryContext = () => React.useContext(AssetCategoryContext);

export function AssetCategoryProvider({ children }: { children?: JSX.Element }) {
  const [category, setCategory] = React.useState<AssetCategory>();
  React.useEffect(() => {
    request
      .get<{ type: AssetCategory }>('webConfig')
      .then((res) => {
        if (res.data.code === 200) {
          setCategory(res.data.data.type);
        } else {
          throw Error(`API: webConfig occur errors`);
        }
      })
      .catch((err) => {
        throw Error(err);
      });
  }, []);
  if (category === undefined) return <Spin />;
  return <AssetCategoryContext.Provider value={category}>{children}</AssetCategoryContext.Provider>;
}
