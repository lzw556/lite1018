import { AssetTypes } from './constants';

export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
};

export type AssetRow = {
  ID: number;
  Name: string;
  Type: number;
  ParentID: number;
  ProjectID: number;
};

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return { id: values.ID, name: values.Name, parent_id: values.ParentID, type: values.Type };
}

export function filterAssets(assets: AssetRow[], type: keyof typeof AssetTypes, parentId?: number) {
  return assets.filter((asset) => {
    return parentId
      ? asset.Type === AssetTypes[type].type && parentId === asset.ParentID
      : asset.Type === AssetTypes[type].type;
  });
}
