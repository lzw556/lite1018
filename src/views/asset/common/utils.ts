import { excludeTreeNode } from '../../../utils/tree';
import { getRealPoints } from '../../monitoring-point';
import { Asset, AssetCategoryChain, AssetRow, AssetTreeNode } from '../types';

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

export function getParents(
  assets: AssetRow[],
  lastAssets?: AssetCategoryChain[],
  assetId?: number
) {
  const parents: AssetRow[] = [];
  excludeTreeNode(
    assets,
    (asset) => {
      if (lastAssets === undefined) {
        parents.push(asset);
      } else {
        if (lastAssets.map(({ key }) => key).includes(asset.type)) {
          parents.push(asset);
        }
      }
    },
    assetId
  );
  return parents;
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
    ...points
      .map((p) => ({
        ...p,
        parentId: p.assetId,
        id: `${p.id}-${p.type}`
      }))
      .sort((prev, next) => {
        const { index: prevIndex } = prev.attributes || { index: 88 };
        const { index: nextIndex } = next.attributes || { index: 88 };
        return prevIndex - nextIndex;
      })
  ];
  return { ...asset, children };
}
