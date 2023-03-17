import { AssetRow } from '../asset';
import { FLANGE_TYPES } from './types';

export * from './manage/create';
export * from './manage/update';
export * from './show/index';
export * from './card';
export * from './icon';
export * from './monitoringPointsTable';
export * from './types';
export function checkIsFlangePreload(flange?: AssetRow) {
  return flange?.attributes?.sub_type === 1;
}
export function sortFlangesByAttributes(assets: AssetRow[]) {
  const lastFlangeType = FLANGE_TYPES[FLANGE_TYPES.length - 1].value;
  return assets
    .sort((prev, next) => {
      const { index: prevIndex } = prev.attributes || { index: 5 };
      const { index: nextIndex } = next.attributes || { index: 5 };
      return prevIndex - nextIndex;
    })
    .sort((prev, next) => {
      const { type: prevType } = prev.attributes || { type: lastFlangeType };
      const { type: nextType } = next.attributes || { type: lastFlangeType };
      return prevType - nextType;
    })
    .sort((prev, next) => {
      return prev.type - next.type;
    });
}
export function getFlanges(assets: AssetRow[]) {
  const flanges: AssetRow[] = [];
  assets.forEach((asset) => {
    if (asset.children) flanges.push(...asset.children);
  });
  return flanges;
}
export { FLANGE_PATHNAME } from './types';
