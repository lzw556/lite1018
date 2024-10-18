import { DeviceType } from '../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from './common';

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
  { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
  { id: MonitoringPointTypeValue.PRELOAD_ATTITUDE, label: MonitoringPointTypeText.PRELOAD_ATTITUDE }
];
