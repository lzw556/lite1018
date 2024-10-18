import { DeviceType } from '../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from './common';

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
