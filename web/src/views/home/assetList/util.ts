import { AssetTypes } from '../common/constants';
import { AssetRow } from './props';

export function sortFlangesByAttributes(assets: AssetRow[]) {
  const lastFlangeType =
    AssetTypes.Flange.categories && AssetTypes.Flange.categories.length > 0
      ? AssetTypes.Flange.categories[AssetTypes.Flange.categories.length - 1].value
      : 0;
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
    });
}
