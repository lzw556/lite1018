import { Device } from '../../types/device';
import { DeviceType } from '../../types/device_type';

export const MONITORING_POINT = 'MONITORING_POINT';
export const MONITORING_POINT_LIST = `MONITORING_POINT_LIST`;
export const INVALID_MONITORING_POINT = `ABNORMAL_MONITORING_POINT`;

export const MONITORING_POINT_PATHNAME = 'monitoring-points';

export enum MonitoringPointTypeValue {
  LOOSENING_ANGLE = 10101,
  THICKNESS = 10201,
  PRELOAD = 10301,
  VIBRATION = 10401,
  ANGLE_DIP = 10501,
  PRESSURE = 10601,
  PRESSURE_TEMPERATURE = 10602,
  FLANGE_PRELOAD = 10311,
  TEMPERATURE = 10811
}

export enum MonitoringPointTypeText {
  LOOSENING_ANGLE = 'FIELD_LOOSENING_ANGLE',
  THICKNESS = 'FIELD_THICKNESS',
  PRELOAD = 'SETTING_GROUP_PRELOAD',
  VIBRATION = 'VIBRATION',
  ANGLE_DIP = 'DEVICE_TYPE_INCLINATION',
  PRESSURE = 'FIELD_PRESSURE2',
  FLANGE_PRELOAD = 'FLANGE_PRELOAD',
  TEMPERATURE = 'DEVICE_TYPE_TEMPERATURE'
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
    title: 'DYNAMIC_DATA',
    fields: [
      { label: 'FIELD_PRELOAD', value: 'dynamic_preload', unit: 'kN' },
      { label: 'FIELD_PRESSURE', value: 'dynamic_pressure', unit: 'MPa' },
      { label: 'FIELD_LENGTH', value: 'dynamic_length', unit: 'mm' },
      { label: 'FIELD_TOF', value: 'dynamic_tof', unit: 'ns' },
      { label: 'FIELD_ACCELERATION', value: 'dynamic_acceleration', unit: 'g' }
    ],
    metaData: [
      { label: 'FIELD_PRELOAD', value: 'min_preload', unit: 'kN' },
      { label: 'FIELD_LENGTH', value: 'min_length', unit: 'mm' },
      { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃' },
      { label: 'FIELD_TOF', value: 'min_tof', unit: 'ns' },
      { label: 'FIELD_DEFECT_LOCATION', value: 'defect_location', unit: 'mm' }
    ]
  },
  waveData: {
    serverDatatype: 'waveform',
    title: 'WAVEFORM_DATA',
    fields: [{ label: 'mv', value: 'mv', unit: '' }],
    metaData: [
      { label: 'FIELD_PRELOAD', value: 'preload', unit: 'kN' },
      { label: 'FIELD_PRESSURE', value: 'pressure', unit: 'MPa' },
      { label: 'FIELD_TOF', value: 'tof', unit: 'ns' },
      { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃' },
      { label: 'FIELD_LENGTH', value: 'length', unit: 'mm' }
    ]
  }
};
const dynamic_thickness: { dynamicData?: DynamicData; waveData?: WaveData } = {
  waveData: {
    serverDatatype: 'waveform',
    title: 'WAVEFORM_DATA',
    fields: [{ label: 'mv', value: 'mv', unit: '' }],
    metaData: [
      { label: 'FIELD_THICKNESS', value: 'thickness', unit: 'mm' },
      { label: 'FIELD_TEMPERATURE', value: 'temp', unit: '℃' },
      { label: 'FIELD_TOF', value: 'tof', unit: 'ns' },
      { label: 'FIELD_ENVIRONMENT_TEMPERATURE', value: 'envTemp', unit: '℃' },
      { label: 'FIELD_SIGNAL_STRENGTH', value: 'sigStrength', unit: '' }
    ]
  }
};
const dynamic_vibration: { dynamicData?: DynamicData; waveData?: WaveData } = {
  dynamicData: {
    serverDatatype: 'raw',
    title: 'WAVEFORM_DATA',
    fields: [
      { label: 'FIELD_ACCELERATION_TIME_DOMAIN', value: 'accelerationTimeDomain', unit: 'm/s²' },
      {
        label: 'FIELD_ACCELERATION_FREQUENCY_DOMAIN',
        value: 'accelerationFrequencyDomain',
        unit: 'm/s²'
      },
      { label: 'FIELD_VELOCITY_TIME_DOMAIN', value: 'velocityTimeDomain', unit: 'mm/s' },
      { label: 'FIELD_VELOCITY_FREQUENCY_DOMAIN', value: 'velocityFrequencyDomain', unit: 'mm/s' },
      { label: 'FIELD_DISPLACEMENT_TIME_DOMAIN', value: 'displacementTimeDomain', unit: 'μm' },
      {
        label: 'FIELD_DISPLACEMENT_FREQUENCY_DOMAIN',
        value: 'displacementFrequencyDomain',
        unit: 'μm'
      }
    ],
    metaData: []
  }
};
export const MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING = new Map([
  [MonitoringPointTypeValue.LOOSENING_ANGLE, dynamic_preload],
  [MonitoringPointTypeValue.THICKNESS, dynamic_thickness],
  [MonitoringPointTypeValue.PRELOAD, dynamic_preload],
  [MonitoringPointTypeValue.VIBRATION, dynamic_vibration]
]);

export const MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING = new Map([
  [MonitoringPointTypeValue.LOOSENING_ANGLE, [DeviceType.BoltLoosening]],
  [
    MonitoringPointTypeValue.THICKNESS,
    [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion]
  ],
  [
    MonitoringPointTypeValue.PRELOAD,
    [
      DeviceType.BoltElongation,
      [DeviceType.BoltElongation4Channels, DeviceType.BoltElongation8Channels]
    ]
  ],
  [
    MonitoringPointTypeValue.VIBRATION,
    [
      DeviceType.VibrationTemperature3Axis,
      DeviceType.VibrationTemperature3AxisAdvanced,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.VibrationTemperature3AxisNB
    ]
  ],
  [MonitoringPointTypeValue.ANGLE_DIP, [DeviceType.AngleDip]],
  [MonitoringPointTypeValue.PRESSURE, [DeviceType.Pressure]],
  [
    MonitoringPointTypeValue.PRESSURE_TEMPERATURE,
    [DeviceType.Pressure, DeviceType.PressureTemperature]
  ],
  [MonitoringPointTypeValue.TEMPERATURE, [DeviceType.Temperature]],
  [
    MonitoringPointTypeValue.FLANGE_PRELOAD,
    [
      DeviceType.BoltElongation,
      [DeviceType.BoltElongation4Channels, DeviceType.BoltElongation8Channels]
    ]
  ]
]);

export const MONITORING_POINT_FIRST_CLASS_FIELDS_MAPPING = new Map([
  [
    MonitoringPointTypeValue.LOOSENING_ANGLE,
    ['loosening_angle', 'attitude', 'motion', 'temperature', 'measurement_index']
  ],
  [MonitoringPointTypeValue.THICKNESS, ['thickness', 'temperature', 'annualized_corrosion_rate']],
  [MonitoringPointTypeValue.PRELOAD, ['preload', 'pressure', 'tof', 'temperature']],
  [
    MonitoringPointTypeValue.VIBRATION,
    ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature']
  ],
  [MonitoringPointTypeValue.ANGLE_DIP, ['inclination', 'pitch', 'roll', 'waggle']],
  [MonitoringPointTypeValue.PRESSURE, ['pressure', 'temperature']],
  [MonitoringPointTypeValue.TEMPERATURE, ['temperature']],
  [MonitoringPointTypeValue.FLANGE_PRELOAD, ['preload', 'pressure', 'tof', 'temperature']]
]);

export type DataType = 'raw' | 'waveform';

export type DynamicData = {
  title: 'DYNAMIC_DATA' | 'WAVEFORM_DATA';
  serverDatatype: DataType;
  fields: { label: string; value: string; unit: string }[];
  metaData: { label: string; value: string; unit: string }[];
};
export type WaveData = {
  title: 'WAVEFORM_DATA';
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
  parentId: number;
};

export type HistoryData = {
  timestamp: number;
  values: Property[];
}[];
