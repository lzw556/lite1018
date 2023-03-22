import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = 'IOT_CLOUD_MONITORING_SYSTEM';
export const AREA = 'AREA';
export const AREA_ASSET = 'ASSET';
export const AREA_ASSET_TYPE_ID = 201;
export const AREA_ASSET_TYPES = [
  { key: 221, label: 'PIPE' },
  { key: 222, label: 'TANK' }
];
export const AREA_ASSET_TYPE_PATHNAME = 'corrosion';
export const SENSORS = [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion];
export const MONITORING_POINTS = [
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS }
];
export const MENUS_HIDDEN = [];

export const CREATE_AREA = `CREATE_AREA`;
export const UPDATE_AREA = `UPDATE_AREA`;
export const SELECT_AREA = `SELECT_AREA`;
export const PLEASE_SELECT_AREA = `PLEASE_SELECT_AREA`;
export const AREA_NAME = `AREA_NAME`;
export const PLEASE_INPUT_AREA_NAME = `PLEASE_INPUT_AREA_NAME`;
export const INVALID_AREA = `INVALID_AREA`;
export const NO_AREAS = `NO_AREAS`;

export const CREATE_AREA_ASSET = `CREATE_AREA_ASSET`;
export const UPDATE_AREA_ASSET = `UPDATE_AREA_ASSET`;
export const AREA_ASSET_NAME = `AREA_ASSET_NAME`;
export const PLEASE_INPUT_AREA_ASSET_NAME = `PLEASE_INPUT_AREA_ASSET_NAME`;
export const AREA_ASSET_TYPE = `AREA_ASSET_TYPE`;
export const PLEASE_SELECT_AREA_ASSET_TYPE = `PLEASE_SELECT_AREA_ASSET_TYPE`;
export const PLEASE_SELECT_AREA_ASSET = `PLEASE_SELECT_AREA_ASSET`;
