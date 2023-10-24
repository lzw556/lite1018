import { PROPERTY_CATEGORIES } from '../../constants/properties';
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
  PRESSURE = 10601,
  PRESSURE_TEMPERATURE = 10602,
  FLANGE_PRELOAD = 10311,
  TEMPERATURE = 10811,
  TOWER_INCLINATION = 10511,
  TOWER_BASE_SETTLEMENT = 10512,
  PRELOAD_ATTITUDE = 10303,
  VIBRATION_RPM = 10402,
  VIBRATION_THREE_AXIS_RPM = 10403
}

export enum MonitoringPointTypeText {
  LOOSENING_ANGLE = 'FIELD_LOOSENING_ANGLE',
  THICKNESS = 'FIELD_THICKNESS',
  PRELOAD = 'SETTING_GROUP_PRELOAD',
  VIBRATION = 'VIBRATION',
  PRESSURE = 'FIELD_PRESSURE2',
  PRESSURE_TEMPERATURE = 'DEVICE_TYPE_PRESSURE_TEMPERATURE',
  FLANGE_PRELOAD = 'FLANGE_PRELOAD',
  TEMPERATURE = 'FIELD_TEMPERATURE',
  TOWER_INCLINATION = 'TOWER_INCLINATION',
  TOWER_BASE_SETTLEMENT = 'TOWER_BASE_SETTLEMENT',
  PRELOAD_ATTITUDE = 'PRELOAD_ATTITUDE',
  VIBRATION_RPM = 'VIBRATION_RPM',
  VIBRATION_THREE_AXIS_RPM = 'VIBRATION_THREE_AXIS_RPM'
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
      { label: 'FIELD_PRELOAD', value: 'dynamic_preload', unit: 'kN', precision: 0 },
      { label: 'FIELD_PRESSURE', value: 'dynamic_pressure', unit: 'MPa', precision: 0 },
      { label: 'FIELD_LENGTH', value: 'dynamic_length', unit: 'mm', precision: 1 },
      { label: 'FIELD_TOF', value: 'dynamic_tof', unit: 'ns', precision: 0 },
      { label: 'FIELD_ACCELERATION', value: 'dynamic_acceleration', unit: 'g', precision: 3 }
    ],
    metaData: [
      { label: 'FIELD_PRELOAD', value: 'min_preload', unit: 'kN', precision: 0 },
      { label: 'FIELD_LENGTH', value: 'min_length', unit: 'mm', precision: 1 },
      { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃', precision: 1 },
      { label: 'FIELD_TOF', value: 'min_tof', unit: 'ns', precision: 0 },
      { label: 'FIELD_DEFECT_LOCATION', value: 'defect_location', unit: 'mm', precision: 3 }
    ]
  },
  waveData: {
    serverDatatype: 'waveform',
    title: 'WAVEFORM_DATA',
    fields: [{ label: 'mV', value: 'mv', unit: '', precision: 2 }],
    metaData: [
      { label: 'FIELD_PRELOAD', value: 'preload', unit: 'kN', precision: 0 },
      { label: 'FIELD_PRESSURE', value: 'pressure', unit: 'MPa', precision: 0 },
      { label: 'FIELD_TOF', value: 'tof', unit: 'ns', precision: 0 },
      { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃', precision: 1 },
      { label: 'FIELD_LENGTH', value: 'thickness', unit: 'mm', precision: 1 }
    ]
  }
};
const dynamic_thickness: { dynamicData?: DynamicData; waveData?: WaveData } = {
  waveData: {
    serverDatatype: 'waveform',
    title: 'WAVEFORM_DATA',
    fields: [{ label: 'mV', value: 'mv', unit: '', precision: 2 }],
    metaData: [
      { label: 'FIELD_THICKNESS', value: 'thickness', unit: 'mm', precision: 3 },
      { label: 'FIELD_TEMPERATURE', value: 'temp', unit: '℃', precision: 1 },
      { label: 'FIELD_TOF', value: 'tof', unit: 'ns', precision: 0 },
      { label: 'FIELD_ENVIRONMENT_TEMPERATURE', value: 'envTemp', unit: '℃', precision: 1 },
      { label: 'FIELD_SIGNAL_STRENGTH', value: 'sigStrength', unit: '', precision: 1 }
    ]
  }
};
const dynamic_vibration: { dynamicData?: DynamicData; waveData?: WaveData } = {
  dynamicData: {
    serverDatatype: 'raw',
    title: 'WAVEFORM_DATA',
    fields: [
      {
        label: 'FIELD_ACCELERATION_TIME_DOMAIN',
        value: 'accelerationTimeDomain',
        unit: '',
        precision: 1
      },
      {
        label: 'FIELD_ACCELERATION_FREQUENCY_DOMAIN',
        value: 'accelerationFrequencyDomain',
        unit: '',
        precision: 3
      },
      {
        label: 'FIELD_VELOCITY_TIME_DOMAIN',
        value: 'velocityTimeDomain',
        unit: '',
        precision: 1
      },
      {
        label: 'FIELD_VELOCITY_FREQUENCY_DOMAIN',
        value: 'velocityFrequencyDomain',
        unit: '',
        precision: 3
      },
      {
        label: 'FIELD_DISPLACEMENT_TIME_DOMAIN',
        value: 'displacementTimeDomain',
        unit: '',
        precision: 1
      },
      {
        label: 'FIELD_DISPLACEMENT_FREQUENCY_DOMAIN',
        value: 'displacementFrequencyDomain',
        unit: '',
        precision: 3
      }
    ],
    metaData: []
  }
};
const dynamic_angle: { dynamicData?: DynamicData; waveData?: WaveData } = {
  dynamicData: {
    serverDatatype: 'raw',
    title: 'DYNAMIC_DATA',
    fields: [
      {
        label: 'FIELD_DISPLACEMENT_RADIAL2',
        value: 'dynamic_displacement_radial',
        unit: 'mm',
        precision: 2
      },
      {
        label: 'FIELD_DISPLACEMENT_EW2',
        value: 'dynamic_displacement_ew',
        unit: 'mm',
        precision: 2
      },
      {
        label: 'FIELD_DISPLACEMENT_NS2',
        value: 'dynamic_displacement_ns',
        unit: 'mm',
        precision: 2
      },
      {
        label: 'FIELD_INCLINATION_RADIAL2',
        value: 'dynamic_inclination_radial',
        unit: '°',
        precision: 2
      },
      { label: 'FIELD_INCLINATION_EW2', value: 'dynamic_inclination_ew', unit: '°', precision: 2 },
      { label: 'FIELD_INCLINATION_NS2', value: 'dynamic_inclination_ns', unit: '°', precision: 2 },
      { label: 'FIELD_DIRECTION', value: 'dynamic_direction', unit: '°', precision: 2 },
      { label: 'FIELD_WAGGLE', value: 'dynamic_waggle', unit: 'g', precision: 2 }
    ],
    metaData: [
      { label: 'FIELD_INCLINATION', value: 'mean_inclination', unit: '°', precision: 2 },
      { label: 'FIELD_PITCH', value: 'mean_pitch', unit: '°', precision: 2 },
      { label: 'FIELD_ROLL', value: 'mean_roll', unit: '°', precision: 2 },
      { label: 'FIELD_WAGGLE', value: 'mean_waggle', unit: 'g', precision: 2 },
      { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃', precision: 1 }
    ]
  }
};
export const MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING = new Map([
  [MonitoringPointTypeValue.THICKNESS, dynamic_thickness],
  [MonitoringPointTypeValue.PRELOAD, dynamic_preload],
  [MonitoringPointTypeValue.PRELOAD_ATTITUDE, dynamic_preload],
  [MonitoringPointTypeValue.VIBRATION, dynamic_vibration],
  [MonitoringPointTypeValue.VIBRATION_RPM, dynamic_vibration],
  [MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM, dynamic_vibration],
  [MonitoringPointTypeValue.TOWER_INCLINATION, dynamic_angle],
  [MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT, dynamic_angle]
]);

export const MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING = new Map([
  [
    MonitoringPointTypeValue.LOOSENING_ANGLE,
    [DeviceType.BoltLoosening, DeviceType.BoltLooseningWIRED]
  ],
  [
    MonitoringPointTypeValue.THICKNESS,
    [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion]
  ],
  [
    MonitoringPointTypeValue.PRELOAD,
    [
      DeviceType.BoltElongation,
      DeviceType.BoltElongation4Channels,
      DeviceType.BoltElongation8Channels
    ]
  ],
  [MonitoringPointTypeValue.PRELOAD_ATTITUDE, [DeviceType.BoltElongation]],
  [
    MonitoringPointTypeValue.VIBRATION,
    [
      DeviceType.SVT210R,
      DeviceType.SVT220520,
      DeviceType.VibrationTemperature3AxisNB,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.SVT210510,
      DeviceType.SVT110
    ]
  ],
  [MonitoringPointTypeValue.VIBRATION_RPM, [DeviceType.SVT220S1]],
  [
    MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM,
    [DeviceType.SVT210RS, DeviceType.SVT210S, DeviceType.SVT220S3]
  ],
  [MonitoringPointTypeValue.TOWER_INCLINATION, [DeviceType.AngleDip]],
  [MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT, [DeviceType.AngleDip]],
  [
    MonitoringPointTypeValue.PRESSURE,
    [
      DeviceType.Pressure,
      DeviceType.PressureTemperature,
      DeviceType.PressureTemperatureWIRED,
      DeviceType.PressureGuoDa,
      DeviceType.PressureWoErKe
    ]
  ],
  [
    MonitoringPointTypeValue.PRESSURE_TEMPERATURE,
    [DeviceType.PressureTemperature, DeviceType.PressureTemperatureWIRED, DeviceType.PressureWoErKe]
  ],
  [MonitoringPointTypeValue.TEMPERATURE, [DeviceType.Temperature, DeviceType.TemperatureWIRED]],
  [
    MonitoringPointTypeValue.FLANGE_PRELOAD,
    [
      DeviceType.BoltElongation,
      DeviceType.BoltElongation4Channels,
      DeviceType.BoltElongation8Channels
    ]
  ]
]);

export const MONITORING_POINT_TYPE_VALUE_ASSET_CATEGORY_KEY_MAPPING = new Map([
  [
    102,
    [
      MonitoringPointTypeValue.LOOSENING_ANGLE,
      MonitoringPointTypeValue.PRELOAD,
      MonitoringPointTypeValue.PRELOAD_ATTITUDE
    ]
  ],
  [
    103,
    [MonitoringPointTypeValue.TOWER_INCLINATION, MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT]
  ]
]);

export type DataType = 'raw' | 'waveform';

export type DynamicData = {
  title: 'DYNAMIC_DATA' | 'WAVEFORM_DATA';
  serverDatatype: DataType;
  fields: { label: string; value: string; unit: string; precision: number }[];
  metaData: { label: string; value: string; unit: string; precision: number }[];
};
export type WaveData = {
  title: 'WAVEFORM_DATA';
  serverDatatype: DataType;
  fields: { label: string; value: string; unit: string; precision: number }[];
  metaData: { label: string; value: string; unit: string; precision: number }[];
};

export type MonitoringPoint = {
  id: number;
  name: string;
  type: number;
  asset_id: number;
  device_id?: number;
  attributes?: { index?: number };
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
  attributes?: {
    index: number;
    tower_install_height?: number;
    tower_base_radius?: number;
    initial_thickness?: number;
    initial_thickness_enabled?: boolean;
    critical_thickness?: number;
    critical_thickness_enabled?: boolean;
  };
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

export const MONITORING_POINT_DISPLAY_PROPERTIES = {
  [MonitoringPointTypeValue.LOOSENING_ANGLE]: PROPERTY_CATEGORIES.SA,
  [MonitoringPointTypeValue.PRELOAD]: PROPERTY_CATEGORIES.SAS,
  [MonitoringPointTypeValue.FLANGE_PRELOAD]: PROPERTY_CATEGORIES.SAS,
  [MonitoringPointTypeValue.PRELOAD_ATTITUDE]: PROPERTY_CATEGORIES.SAS,
  [MonitoringPointTypeValue.THICKNESS]: PROPERTY_CATEGORIES.DC_NORMAL,
  [MonitoringPointTypeValue.VIBRATION]: PROPERTY_CATEGORIES.SVT210R,
  [MonitoringPointTypeValue.VIBRATION_RPM]: PROPERTY_CATEGORIES.SVT220S1S3,
  [MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM]: PROPERTY_CATEGORIES.SVT220S1S3,
  [MonitoringPointTypeValue.TOWER_INCLINATION]: PROPERTY_CATEGORIES.TOWER,
  [MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT]: PROPERTY_CATEGORIES.TOWER,
  [MonitoringPointTypeValue.TEMPERATURE]: PROPERTY_CATEGORIES.ST,
  [MonitoringPointTypeValue.PRESSURE_TEMPERATURE]: PROPERTY_CATEGORIES.SPT
};
