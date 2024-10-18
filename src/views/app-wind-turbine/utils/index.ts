import { flange, tower, wind } from '../constants';

export * from './useAssetChain';
export * from './useHistoryDataOfAsset';
export function isWindRelated(type: number) {
  return type === wind.type || type === flange.type || type === tower.type;
}
