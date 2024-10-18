import { MonitoringPointRow, Points } from '../monitoring-point';
import { AssetRow } from '../types';

export type AssetTreeNode = (Omit<AssetRow, 'children'> | MonitoringPointRow) & {
  children: (AssetRow | (Omit<MonitoringPointRow, 'id'> & { id: string | number }))[];
};

export function combine(asset: AssetRow): AssetTreeNode {
  const points = Points.filter(asset.monitoringPoints);
  const children = [
    ...sort(asset.children ?? []),
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

function sort(assets: AssetRow[]) {
  return [...assets].sort(
    (prev, crt) =>
      (prev.attributes?.index ?? Number.MAX_VALUE) - (crt.attributes?.index ?? Number.MAX_VALUE)
  );
}
