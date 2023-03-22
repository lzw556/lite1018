import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = 'WIND_TURBINE_BOLT_MONITORING_SYSTEM';
export const WIND_TURBINE = 'WIND_TURBINE';
export const WIND_TURBINE_ASSET_TYPE_ID = 101;
export const SENSORS = [
  DeviceType.BoltLoosening,
  DeviceType.BoltElongation,
  DeviceType.BoltElongationMultiChannels
];
export const MONITORING_POINTS = [
  {
    id: MonitoringPointTypeValue.LOOSENING_ANGLE,
    label: MonitoringPointTypeText.LOOSENING_ANGLE
  },
  { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD }
];
export const MENUS_HIDDEN = [];

export const CREATE_WIND_TURBINE = `CREATE_WIND_TURBINE`;
export const UPDATE_WIND_TURBINE = `UPDATE_WIND_TURBINE`;
export const SELECT_WIND_TURBINE = `SELECT_WIND_TURBINE`;
export const PLEASE_SELECT_WIND_TURBINE = `PLEASE_SELECT_WIND_TURBINE`;
export const WIND_TURBINE_NAME = `WIND_TURBINE_NAME`;
export const PLEASE_INPUT_WIND_TURBINE_NAME = `PLEASE_INPUT_WIND_TURBINE_NAME`;
export const INVALID_WIND_TURBINE = `INVALID_WIND_TURBINE`;
export const NO_WIND_TURBINES = `NO_WIND_TURBINES`;
