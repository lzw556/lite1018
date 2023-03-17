import { Asset, AssetCategory, AssetRow, ASSET_CATEGORY } from '../..';
import { ROOT_ASSETS } from '../../../../config/assetCategory.config';
import { MONITORING_POINT_PATHNAME } from '../../../monitoring-point';

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

export function getGenerals(assets: AssetRow[]) {
  return assets.filter((a) => a.type === ROOT_ASSETS.get('general'));
}

export function getValidParents(assets: AssetRow[], asset: AssetRow) {
  return getGenerals(assets).filter((a) => a.id !== asset.id && a.parentId !== asset.id);
}

export function sortAssetsByIndex(assets: AssetRow[]) {
  const res = [...assets];
  return res.sort(
    (prev, crt) =>
      (prev.attributes?.index ?? Number.MAX_VALUE) - (crt.attributes?.index ?? Number.MAX_VALUE)
  );
}

export function getPathFromType(category: AssetCategory, type?: number) {
  let pathname = null;
  if (type === ROOT_ASSETS.get('general')) {
    pathname = `/${ASSET_CATEGORY[category]}/`;
  } else {
    pathname = `/${MONITORING_POINT_PATHNAME}/`;
  }
  return pathname;
}
