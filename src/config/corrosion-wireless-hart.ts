import { DeviceType } from '../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from './common';

export const SITE_NAME = 'CORROSION_MONITORING_SYSTEM';

export const SENSORS = [
  DeviceType.NormalTemperatureCorrosion,
  DeviceType.HighTemperatureCorrosion,
  DeviceType.NormalTemperatureCorrosionLora,
  DeviceType.DC110H
];
export const MONITORING_POINTS = [
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS },
  { id: MonitoringPointTypeValue.THICKNESS_HIGH, label: MonitoringPointTypeText.THICKNESS_HIGH }
];
