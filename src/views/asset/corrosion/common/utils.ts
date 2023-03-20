import { Asset, AssetRow } from '../..';
import { AREA_ASSET_TYPE_ID } from '../config';

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return {
    id: values.id,
    name: values.name,
    parent_id: values.parentId,
    type: values.type,
    attributes: values.attributes
  };
}

export function getAreas(assets: AssetRow[]) {
  return assets.filter((a) => a.type === AREA_ASSET_TYPE_ID);
}

export function getAreaAssets(assets: AssetRow[]) {
  const areaAssets: AssetRow[] = [];
  assets.forEach((asset) => {
    if (asset.children) areaAssets.push(...asset.children);
  });
  return areaAssets;
}

export function getValidParents(assets: AssetRow[], assetId: number) {
  return getAreas(assets).filter((a) => a.id !== assetId && a.parentId !== assetId);
}

export function sortAssetsByIndex(assets: AssetRow[]) {
  const res = [...assets];
  return res.sort(
    (prev, crt) =>
      (prev.attributes?.index ?? Number.MAX_VALUE) - (crt.attributes?.index ?? Number.MAX_VALUE)
  );
}
