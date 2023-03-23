import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = 'HYDRO_TURBINE_BOLT_MONITORING_SYSTEM';
export const HYDRO_TURBINE = 'HYDRO_TURBINE';
export const HYDRO_TURBINE_ASSET_TYPE_ID = 111;
export const SENSORS = [
  DeviceType.BoltLoosening,
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

export const CREATE_HYDRO_TURBINE = `CREATE_HYDRO_TURBINE`;
export const UPDATE_HYDRO_TURBINE = `UPDATE_HYDRO_TURBINE`;
export const SELECT_HYDRO_TURBINE = `SELECT_HYDRO_TURBINE`;
export const PLEASE_SELECT_HYDRO_TURBINE = `PLEASE_SELECT_HYDRO_TURBINE`;
export const HYDRO_TURBINE_NAME = `HYDRO_TURBINE_NAME`;
export const PLEASE_INPUT_HYDRO_TURBINE_NAME = `PLEASE_INPUT_HYDRO_TURBINE_NAME`;
export const INVALID_HYDRO_TURBINE = `INVALID_HYDRO_TURBINE`;
export const NO_HYDRO_TURBINES = `NO_HYDRO_TURBINES`;
