import { DeviceType } from '../types/device_type';
import { AssetCategoryChain, AssetCategoryKey, AssetCategoryLabel } from '../views/asset';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../views/monitoring-point';

export const SITE_NAME = 'WIND_TURBINE_BOLT_MONITORING_SYSTEM';

export const SENSORS = [
  DeviceType.BoltLoosening,
  DeviceType.BoltLooseningWIRED,
  DeviceType.BoltElongation,
  DeviceType.BoltElongation4Channels,
  DeviceType.BoltElongation8Channels,
  DeviceType.AngleDip,
  DeviceType.AngleDipNB
];
export const MONITORING_POINTS = [
  {
    id: MonitoringPointTypeValue.LOOSENING_ANGLE,
    label: MonitoringPointTypeText.LOOSENING_ANGLE
  },
  { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
  {
    id: MonitoringPointTypeValue.PRELOAD_ATTITUDE,
    label: MonitoringPointTypeText.PRELOAD_ATTITUDE
  },
  {
    id: MonitoringPointTypeValue.TOWER_INCLINATION,
    label: MonitoringPointTypeText.TOWER_INCLINATION
  },
  {
    id: MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT,
    label: MonitoringPointTypeText.TOWER_BASE_SETTLEMENT
  }
];
export const MENUS_HIDDEN = [];

export const ASSET_CATEGORY_CHAIN: AssetCategoryChain[] = [
  { key: AssetCategoryKey.WIND_TURBINE, label: AssetCategoryLabel.WIND_TURBINE },
  {
    key: AssetCategoryKey.FLANGE,
    label: AssetCategoryLabel.FLANGE,
    isLeaf: true
  },
  {
    key: AssetCategoryKey.TOWER,
    label: AssetCategoryLabel.TOWER,
    isLeaf: true
  }
];
