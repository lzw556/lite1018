import { Device } from '../../types/device';
import { DeviceType } from '../../types/device_type';

export const MONITORING_POINT = '监测点';
export const CREATE_MONITORING_POINT = `添加${MONITORING_POINT}`;
export const PLEASE_CREATE_MONITORING_POINT = `请${CREATE_MONITORING_POINT}`;
export const UPDATE_MONITORING_POINT = `编辑${MONITORING_POINT}`;
export const DELETE_MONITORING_POINT = `删除${MONITORING_POINT}`;
export const MONITORING_POINT_NAME = `${MONITORING_POINT}名称`;
export const PLEASE_INPUT_MONITORING_POINT_NAME = `请填写${MONITORING_POINT_NAME}`;
export const MONITORING_POINT_POSITION = `${MONITORING_POINT}位置`;
export const PLEASE_INPUT_MONITORING_POINT_POSITION = `请填写${MONITORING_POINT_POSITION}`;
export const MONITORING_POINT_TYPE = `${MONITORING_POINT}类型`;
export const PLEASE_SELECT_MONITORING_POINT_TYPE = `请选择${MONITORING_POINT_TYPE}`;
export const MONITORING_POINT_LIST = `${MONITORING_POINT}列表`;
export const INVALID_MONITORING_POINT = `异常${MONITORING_POINT}`;
export const NO_MONITORING_POINTS = `没有${MONITORING_POINT}`;

export const MONITORING_POINT_PATHNAME = 'monitoring-points';

export enum MonitoringPointTypeValue {
  LOOSENING_ANGLE = 10101,
  THICKNESS = 10201,
  PRELOAD = 10301,
  VIBRATION = 10401,
  ANGLE_DIP = 10501,
  PRESSURE = 10601,
  FLANGE_PRELOAD = 10311,
  TEMPERATURE = 10811
}

export enum MonitoringPointTypeText {
  LOOSENING_ANGLE = '松动角度',
  THICKNESS = '厚度',
  PRELOAD = '预紧力',
  VIBRATION = '振动',
  ANGLE_DIP = '倾角',
  PRESSURE = '压力',
  FLANGE_PRELOAD = '法兰预紧力',
  TEMPERATURE = '温度'
}

export type MonitoringPointType = {
  id: MonitoringPointTypeValue;
  label: MonitoringPointTypeText;
  dynamicData?: DynamicData;
  waveData?: WaveData;
};

const dynamic_preload: { dynamicData?: DynamicData; waveData?: WaveData } = {
  dynamicData: {
    serverDatatype: 'raw',
    title: '动态数据',
    fields: [
      { label: '预紧力', value: 'dynamic_preload', unit: 'kN' },
      { label: '应力', value: 'dynamic_pressure', unit: 'MPa' },
      { label: '长度', value: 'dynamic_length', unit: 'mm' },
      { label: '飞行时间', value: 'dynamic_tof', unit: 'ns' },
      { label: '加速度', value: 'dynamic_acceleration', unit: 'g' }
    ],
    metaData: [
      { label: '预紧力', value: 'min_preload', unit: 'kN' },
      { label: '长度', value: 'min_length', unit: 'mm' },
      { label: '温度', value: 'temperature', unit: '℃' },
      { label: '飞行时间', value: 'min_tof', unit: 'ns' },
      { label: '缺陷位置', value: 'defect_location', unit: 'mm' }
    ]
  },
  waveData: {
    serverDatatype: 'waveform',
    title: '波形数据',
    fields: [{ label: 'mv', value: 'mv', unit: '' }],
    metaData: [
      { label: '预紧力', value: 'preload', unit: 'kN' },
      { label: '应力', value: 'pressure', unit: 'MPa' },
      { label: '飞行时间', value: 'tof', unit: 'ns' },
      { label: '温度', value: 'temperature', unit: '℃' },
      { label: '长度', value: 'length', unit: 'mm' }
    ]
  }
};
export const MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING = new Map([
  [MonitoringPointTypeValue.LOOSENING_ANGLE, dynamic_preload],
  [MonitoringPointTypeValue.PRELOAD, dynamic_preload],
  [MonitoringPointTypeValue.FLANGE_PRELOAD, undefined]
]);

export const MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING = new Map([
  [MonitoringPointTypeValue.LOOSENING_ANGLE, [DeviceType.BoltLoosening]],
  [
    MonitoringPointTypeValue.PRELOAD,
    [DeviceType.BoltElongation, DeviceType.BoltElongationMultiChannels]
  ],
  [
    MonitoringPointTypeValue.FLANGE_PRELOAD,
    [DeviceType.BoltElongation, DeviceType.BoltElongationMultiChannels]
  ]
]);

export const MONITORING_POINT_FIRST_CLASS_FIELDS_MAPPING = new Map([
  [
    MonitoringPointTypeValue.LOOSENING_ANGLE,
    ['loosening_angle', 'attitude', 'motion', 'temperature', 'measurement_index']
  ],
  [MonitoringPointTypeValue.PRELOAD, ['preload', 'pressure', 'tof', 'temperature']],
  [MonitoringPointTypeValue.FLANGE_PRELOAD, ['preload', 'pressure', 'tof', 'temperature']]
]);

export type DataType = 'raw' | 'waveform';

export type DynamicData = {
  title: '动态数据';
  serverDatatype: DataType;
  fields: { label: string; value: string; unit: string }[];
  metaData: { label: string; value: string; unit: string }[];
};
export type WaveData = {
  title: '波形数据';
  serverDatatype: DataType;
  fields: { label: string; value: string; unit: string }[];
  metaData: { label: string; value: string; unit: string }[];
};

export type MonitoringPoint = {
  id: number;
  name: string;
  type: number;
  asset_id: number;
  device_id?: number;
  attributes?: { index: number };
  channel?: number;
  device_type?: number;
};

export type Property = {
  key: string;
  name: string;
  precision: number;
  sort: number;
  unit: string;
  fields: { key: string; name: string; dataIndex: number; value: number }[];
  data: { [propName: string]: number };
  isShow: boolean;
};

export type MonitoringPointRow = {
  id: number;
  name: string;
  type: number;
  assetId: number;
  bindingDevices?: (Device & { channel?: number })[];
  attributes?: { index: number };
  assetName: string;
  properties: Property[];
  data?: {
    timestamp: number;
    values: { [propName: string]: number | number[] };
  };
  alertLevel?: number;
};

export type HistoryData = {
  timestamp: number;
  values: Property[];
}[];
