import { DeviceType } from '../types/device_type';
import { AssetCategoryChain, AssetCategoryKey, AssetCategoryLabel } from '../views/asset';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../views/monitoring-point';

export const SITE_NAME = 'IOT_CLOUD_MONITORING_SYSTEM';

export const SENSORS = DeviceType.sensors();
export const MONITORING_POINTS = [
  {
    id: MonitoringPointTypeValue.LOOSENING_ANGLE,
    label: MonitoringPointTypeText.LOOSENING_ANGLE
  },
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS },
  { id: MonitoringPointTypeValue.THICKNESS_HIGH, label: MonitoringPointTypeText.THICKNESS_HIGH },
  { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
  {
    id: MonitoringPointTypeValue.PRELOAD_ATTITUDE,
    label: MonitoringPointTypeText.PRELOAD_ATTITUDE
  },
  { id: MonitoringPointTypeValue.VIBRATION, label: MonitoringPointTypeText.VIBRATION },
  { id: MonitoringPointTypeValue.VIBRATION_RPM, label: MonitoringPointTypeText.VIBRATION_RPM },
  {
    id: MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM,
    label: MonitoringPointTypeText.VIBRATION_THREE_AXIS_RPM
  },
  {
    id: MonitoringPointTypeValue.TOWER_INCLINATION,
    label: MonitoringPointTypeText.TOWER_INCLINATION
  },
  {
    id: MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT,
    label: MonitoringPointTypeText.TOWER_BASE_SETTLEMENT
  },
  { id: MonitoringPointTypeValue.PRESSURE, label: MonitoringPointTypeText.PRESSURE },
  { id: MonitoringPointTypeValue.TEMPERATURE, label: MonitoringPointTypeText.TEMPERATURE }
];
export const MENUS_HIDDEN = ['measurement-management'];

export const ASSET_CATEGORY_CHAIN: AssetCategoryChain[] = [
  { key: AssetCategoryKey.GENERAL, label: AssetCategoryLabel.GENERAL, isLeaf: true, isChild: true }
];
