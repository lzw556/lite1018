import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = '水轮机螺栓监测系统';
export const HYDRO_TURBINE = '水轮机';
export const HYDRO_TURBINE_ASSET_TYPE_ID = 111;
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

export const CREATE_HYDRO_TURBINE = `添加${HYDRO_TURBINE}`;
export const UPDATE_HYDRO_TURBINE = `编辑${HYDRO_TURBINE}`;
export const SELECT_HYDRO_TURBINE = `选择${HYDRO_TURBINE}`;
export const PLEASE_SELECT_HYDRO_TURBINE = `请${SELECT_HYDRO_TURBINE}`;
export const HYDRO_TURBINE_NAME = `${HYDRO_TURBINE}名称`;
export const PLEASE_INPUT_HYDRO_TURBINE_NAME = `请填写${HYDRO_TURBINE_NAME}`;
export const INVALID_HYDRO_TURBINE = `异常${HYDRO_TURBINE}`;
export const NO_HYDRO_TURBINES = `没有${HYDRO_TURBINE}`;
