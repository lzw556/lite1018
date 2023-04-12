import { DeviceType } from '../types/device_type';
import { AssetCategoryChain, AssetCategoryKey, AssetCategoryLabel } from '../views/asset';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../views/monitoring-point';

export const SITE_NAME = 'HYDRO_TURBINE_BOLT_MONITORING_SYSTEM';

export const SENSORS = [
  DeviceType.BoltLoosening,
  DeviceType.BoltLooseningWIRED,
  DeviceType.BoltElongation,
  DeviceType.BoltElongation4Channels,
  DeviceType.BoltElongation8Channels
];
export const MONITORING_POINTS = [
  {
    id: MonitoringPointTypeValue.LOOSENING_ANGLE,
    label: MonitoringPointTypeText.LOOSENING_ANGLE
  },
  { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD }
];
export const MENUS_HIDDEN = [];

export const ASSET_CATEGORY_CHAIN: AssetCategoryChain[] = [
  { key: AssetCategoryKey.HYDRO_TURBINE, label: AssetCategoryLabel.HYDRO_TURBINE },
  {
    key: AssetCategoryKey.FLANGE,
    label: AssetCategoryLabel.FLANGE,
    isLeaf: true
  }
];
