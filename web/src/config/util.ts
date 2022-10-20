import * as Wind from './wind.config';
import * as Base from './base.config';

export function use(appCate: typeof window.assetCategory = 'default') {
  if (appCate === Wind.category) {
    return Wind;
  }
  return Base;
}
