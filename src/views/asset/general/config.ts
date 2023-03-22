import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = 'IOT_CLOUD_MONITORING_SYSTEM';
export const GENERAL = 'GENERAL';
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

export const CREATE_GENERAL = `CREATE_GENERAL`;
export const UPDATE_GENERAL = `UPDATE_GENERAL`;
export const SELECT_GENERAL = `SELECT_GENERAL`;
export const PLEASE_SELECT_GENERAL = `PLEASE_SELECT_GENERAL`;
export const GENERAL_NAME = `GENERAL_NAME`;
export const PLEASE_INPUT_GENERAL_NAME = `PLEASE_INPUT_GENERAL_NAME`;
export const INVALID_GENERAL = `INVALID_GENERAL`;
export const NO_GENERALS = `NO_GENERALS`;
export const GENERAL_PARENT = `GENERAL_PARENT`;
export const PLEASE_SELECT_GENERAL_PARENT = `PLEASE_SELECT_GENERAL_PARENT`;
