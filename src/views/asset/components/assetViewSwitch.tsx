import React from 'react';
import { AssetsContextProvider, ASSET_CATEGORY, useAssetCategoryContext } from '.';

export default function AssetViewSwitch(
  props: Partial<Record<keyof typeof ASSET_CATEGORY, JSX.Element>>
) {
  const category = useAssetCategoryContext();
  return <AssetsContextProvider category={category}>{props[category]}</AssetsContextProvider>;
}
