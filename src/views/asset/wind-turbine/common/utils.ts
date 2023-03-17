import { Asset, AssetCategory, AssetRow, ASSET_CATEGORY } from '../..';
import { ROOT_ASSETS } from '../../../../config/assetCategory.config';
import { FLANGE_ASSET_TYPE_ID, FLANGE_PATHNAME } from '../../../flange';
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

export function getWinds(assets: AssetRow[]) {
  return assets.filter((a) => a.type === ROOT_ASSETS.get('windTurbine'));
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
  if (type === ROOT_ASSETS.get('windTurbine')) {
    pathname = `/${ASSET_CATEGORY[category]}/`;
  } else if (type === FLANGE_ASSET_TYPE_ID) {
    pathname = `/${FLANGE_PATHNAME}/`;
  } else {
    pathname = `/${MONITORING_POINT_PATHNAME}/`;
  }
  return pathname;
}
