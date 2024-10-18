import { DeviceType } from '../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from './common';

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
