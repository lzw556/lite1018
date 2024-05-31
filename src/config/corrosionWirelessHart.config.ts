import { DeviceType } from '../types/device_type';
import { AssetCategoryChain, AssetCategoryKey, AssetCategoryLabel } from '../views/asset';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../views/monitoring-point';

export const SITE_NAME = 'CORROSION_MONITORING_SYSTEM';

export const SENSORS = [
  DeviceType.NormalTemperatureCorrosion,
  DeviceType.HighTemperatureCorrosion,
  DeviceType.DC110H
];
export const MONITORING_POINTS = [
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS },
  { id: MonitoringPointTypeValue.THICKNESS_HIGH, label: MonitoringPointTypeText.THICKNESS_HIGH }
];
export const MENUS_HIDDEN = [];

export const ASSET_CATEGORY_CHAIN: AssetCategoryChain[] = [
  { key: AssetCategoryKey.AREA, label: AssetCategoryLabel.AREA },
  {
    key: AssetCategoryKey.PIPE,
    label: AssetCategoryLabel.PIPE,
    isLeaf: true,
    group: { key: AssetCategoryKey.AREA_ASSET, label: AssetCategoryLabel.GENERAL }
  },
  {
    key: AssetCategoryKey.TANK,
    label: AssetCategoryLabel.TANK,
    isLeaf: true,
    group: { key: AssetCategoryKey.AREA_ASSET, label: AssetCategoryLabel.GENERAL }
  }
];
