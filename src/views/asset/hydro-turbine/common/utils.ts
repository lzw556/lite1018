import { Asset, AssetRow } from '../..';
import { HYDRO_TURBINE_ASSET_TYPE_ID } from '../config';

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

export function getHydros(assets: AssetRow[]) {
  return assets.filter((a) => a.type === HYDRO_TURBINE_ASSET_TYPE_ID);
}

export function sortAssetsByIndex(assets: AssetRow[]) {
  const res = [...assets];
  return res.sort(
    (prev, crt) =>
      (prev.attributes?.index ?? Number.MAX_VALUE) - (crt.attributes?.index ?? Number.MAX_VALUE)
  );
}
