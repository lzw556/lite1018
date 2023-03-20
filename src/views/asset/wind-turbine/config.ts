import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = '风电螺栓监测系统';
export const WIND_TURBINE = '风机';
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

export const CREATE_WIND_TURBINE = `添加${WIND_TURBINE}`;
export const UPDATE_WIND_TURBINE = `编辑${WIND_TURBINE}`;
export const SELECT_WIND_TURBINE = `选择${WIND_TURBINE}`;
export const PLEASE_SELECT_WIND_TURBINE = `请${SELECT_WIND_TURBINE}`;
export const WIND_TURBINE_NAME = `${WIND_TURBINE}名称`;
export const PLEASE_INPUT_WIND_TURBINE_NAME = `请填写${WIND_TURBINE_NAME}`;
export const INVALID_WIND_TURBINE = `异常${WIND_TURBINE}`;
export const NO_WIND_TURBINES = `没有${WIND_TURBINE}`;
