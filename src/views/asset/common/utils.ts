import { excludeTreeNode } from '../../../utils/tree';
import { getRealPoints } from '../../monitoring-point';
import { Asset, AssetRow, AssetTreeNode } from '../types';

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

export function getParents(assets: AssetRow[], assetId?: number, filterRoot?: boolean) {
  const parents: AssetRow[] = [];
  excludeTreeNode(assets, (asset) => parents.push(asset), assetId);
  return parents.filter((a) => (filterRoot ? a.parentId !== 0 : true));
}

export function sortAssetsByIndex(assets: AssetRow[]) {
  const res = [...assets];
  return res.sort(
    (prev, crt) =>
      (prev.attributes?.index ?? Number.MAX_VALUE) - (crt.attributes?.index ?? Number.MAX_VALUE)
  );
}

export function combineMonitoringPointToAsset(asset: AssetRow): AssetTreeNode {
  const points = getRealPoints(asset.monitoringPoints);
  const children = [
    ...sortAssetsByIndex(asset.children ?? []),
    ...points.map((p) => ({
      ...p,
      parentId: p.assetId,
      id: `${p.id}-${p.type}`
    }))
  ];
  return { ...asset, children };
}
