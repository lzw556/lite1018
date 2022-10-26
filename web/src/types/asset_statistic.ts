import { Asset } from './asset';
import { Device } from './device';

export type AssetStatistic = {
  asset: Asset;
  devices: Device[];
  status: number;
};
