import { DeviceType } from '../types/device_type';
import { AssetCategoryChain, AssetCategoryKey, AssetCategoryLabel } from '../views/asset';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../views/monitoring-point';

export const SITE_NAME = 'IOT_CLOUD_MONITORING_SYSTEM';

export const SENSORS = DeviceType.vibrationSensors();
export const MONITORING_POINTS = [
  { id: MonitoringPointTypeValue.VIBRATION, label: MonitoringPointTypeText.VIBRATION },
  { id: MonitoringPointTypeValue.VIBRATION_RPM, label: MonitoringPointTypeText.VIBRATION_RPM },
  {
    id: MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM,
    label: MonitoringPointTypeText.VIBRATION_THREE_AXIS_RPM
  }
];

export const ASSET_CATEGORY_CHAIN: AssetCategoryChain[] = [
  { key: AssetCategoryKey.AREA, label: AssetCategoryLabel.AREA },
  { key: AssetCategoryKey.VIBRATION_MOTOR, label: AssetCategoryLabel.GENERAL, isLeaf: true }
];
