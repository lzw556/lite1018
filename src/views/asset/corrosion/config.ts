import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../monitoring-point/types';

export const SITE_NAME = 'IoT云监控平台';
export const AREA = '区域';
export const AREA_ASSET = '资产';
export const AREA_ASSET_TYPE_ID = 201;
export const AREA_ASSET_TYPES = [
  { key: 221, label: '管道' },
  { key: 222, label: '罐体' }
];
export const AREA_ASSET_TYPE_PATHNAME = 'corrosion';
export const SENSORS = [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion];
export const MONITORING_POINTS = [
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS }
];
export const MENUS_HIDDEN = [];

export const CREATE_AREA = `添加${AREA}`;
export const UPDATE_AREA = `编辑${AREA}`;
export const SELECT_AREA = `选择${AREA}`;
export const PLEASE_SELECT_AREA = `请${SELECT_AREA}`;
export const AREA_NAME = `${AREA}名称`;
export const PLEASE_INPUT_AREA_NAME = `请填写${AREA_NAME}`;
export const INVALID_AREA = `异常${AREA}`;
export const NO_AREAS = `没有${AREA}`;
export const AREA_PARENT = `上级${AREA}`;
export const PLEASE_SELECT_AREA_PARENT = `请选择${AREA_PARENT}`;

export const CREATE_AREA_ASSET = `添加${AREA_ASSET}`;
export const UPDATE_AREA_ASSET = `编辑${AREA_ASSET}`;
export const AREA_ASSET_NAME = `${AREA_ASSET}名称`;
export const PLEASE_INPUT_AREA_ASSET_NAME = `请填写${AREA_ASSET_NAME}`;
export const AREA_ASSET_TYPE = `${AREA_ASSET}类型`;
export const PLEASE_SELECT_AREA_ASSET_TYPE = `请选择${AREA_ASSET_TYPE}`;
export const PLEASE_SELECT_AREA_ASSET = `请选择${AREA_ASSET}`;
