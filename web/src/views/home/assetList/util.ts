import * as AppConfig from '../../../config';
import { AssetRow } from './props';

export function sortFlangesByAttributes(assets: AssetRow[]) {
  const categories = AppConfig.use('wind').assetType.secondAsset?.categories || [];
  const lastFlangeType = categories.length > 0 ? categories[categories.length - 1].value : 0;
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
