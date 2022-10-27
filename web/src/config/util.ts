import * as Wind from './wind.config';
import * as Base from './base.config';

export function use(appCate: typeof window.assetCategory = 'default') {
  if (appCate === Wind.category) {
    return Wind;
  }
  return Base;
}

export function getDynamicDataConfigs(typeId: number) {
  const pointType = Object.values(use(window.assetCategory).measurementTypes).find(
    (type) => type.id === typeId
  );
  return pointType ? pointType.dynamicData : undefined;
}
