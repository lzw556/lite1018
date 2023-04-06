import { DeviceType } from '../types/device_type';
import { AssetCategoryChain, AssetCategoryKey, AssetCategoryLabel } from '../views/asset';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../views/monitoring-point';

export const SITE_NAME = 'IOT_CLOUD_MONITORING_SYSTEM';

export const SENSORS = [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion];
export const MONITORING_POINTS = [
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS }
];
export const MENUS_HIDDEN = [];

export const ASSET_CATEGORY_CHAIN: AssetCategoryChain[] = [
  { key: AssetCategoryKey.AREA, label: AssetCategoryLabel.AREA },
  {
    key: AssetCategoryKey.AREA_ASSET,
    label: AssetCategoryLabel.GENERAL,
    isLeaf: true,
    options: [
      { key: AssetCategoryKey.PIPE, label: AssetCategoryLabel.PIPE },
      { key: AssetCategoryKey.TANK, label: AssetCategoryLabel.TANK }
    ]
  }
];
