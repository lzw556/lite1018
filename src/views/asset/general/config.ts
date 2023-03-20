import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = 'IoT云监控平台';
export const GENERAL = '资产';
export const GENERAL_ASSET_TYPE_ID = 100;
export const SENSORS = DeviceType.sensors();
export const MONITORING_POINTS = [
  {
    id: MonitoringPointTypeValue.LOOSENING_ANGLE,
    label: MonitoringPointTypeText.LOOSENING_ANGLE
  },
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS },
  { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
  { id: MonitoringPointTypeValue.VIBRATION, label: MonitoringPointTypeText.VIBRATION },
  { id: MonitoringPointTypeValue.ANGLE_DIP, label: MonitoringPointTypeText.ANGLE_DIP },
  { id: MonitoringPointTypeValue.PRESSURE, label: MonitoringPointTypeText.PRESSURE },
  { id: MonitoringPointTypeValue.TEMPERATURE, label: MonitoringPointTypeText.TEMPERATURE }
];
export const MENUS_HIDDEN = ['measurement-management'];

export const CREATE_GENERAL = `添加${GENERAL}`;
export const UPDATE_GENERAL = `编辑${GENERAL}`;
export const SELECT_GENERAL = `选择${GENERAL}`;
export const PLEASE_SELECT_GENERAL = `请${SELECT_GENERAL}`;
export const GENERAL_NAME = `${GENERAL}名称`;
export const PLEASE_INPUT_GENERAL_NAME = `请填写${GENERAL_NAME}`;
export const INVALID_GENERAL = `异常${GENERAL}`;
export const NO_GENERALS = `没有${GENERAL}`;
export const GENERAL_PARENT = `上级${GENERAL}`;
export const PLEASE_SELECT_GENERAL_PARENT = `请选择${GENERAL_PARENT}`;
