import { DeviceType } from '../../../types/device_type';
import { DataType } from '../summary/measurement/contentTabs/dynamicDataHelper';

export const AssetViews = ['WindTurbineOverview', 'FlangeOverview', 'BoltOverview'];

export const measurementTypes: Record<
  | 'loosening_angle'
  | 'preload'
  | 'thickness'
  | 'vibration'
  | 'angleDip'
  | 'pressure'
  | 'flangePreload',
  {
    id: number;
    label: string;
    url: string;
    firstClassFieldKeys: string[];
    deviceType: number[];
    dynamicData?: {
      title: string;
      serverDatatype: DataType;
      fields: { label: string; value: string; unit: string }[];
      metaData: { label: string; value: string; unit: string }[];
    };
    waveData?: {
      title: string;
      serverDatatype: DataType;
      fields: { label: string; value: string; unit: string }[];
      metaData: { label: string; value: string; unit: string }[];
    };
    hidden?: boolean;
  }
> = {
  loosening_angle: {
    id: 10101,
    label: '松动角度',
    url: '/bolt',
    firstClassFieldKeys: [
      'loosening_angle',
      'attitude',
      'motion',
      'temperature',
      'measurement_index'
    ],
    deviceType: [DeviceType.BoltLoosening]
  },
  preload: {
    id: 10301,
    label: '预紧力',
    url: '/bolt',
    firstClassFieldKeys: ['preload', 'pressure', 'tof', 'temperature'],
    deviceType: [DeviceType.BoltElongation],
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
  },
  thickness: {
    id: 10201,
    label: '厚度',
    url: '/bolt',
    firstClassFieldKeys: ['thickness', 'temperature', 'annualized_corrosion_rate'],
    deviceType: [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion],
    waveData: {
      serverDatatype: 'waveform',
      title: '波形数据',
      fields: [{ label: 'mv', value: 'mv', unit: '' }],
      metaData: [
        { label: '厚度', value: 'thickness', unit: 'mm' },
        { label: '温度', value: 'temp', unit: '℃' },
        { label: '飞行时间', value: 'tof', unit: 'ns' },
        { label: '环境温度', value: 'envTemp', unit: '℃' },
        { label: '信号强度', value: 'sigStrength', unit: '' }
      ]
    }
  },
  vibration: {
    id: 10401,
    label: '振动',
    url: '/bolt',
    firstClassFieldKeys: ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature'],
    deviceType: [
      DeviceType.VibrationTemperature3Axis,
      DeviceType.VibrationTemperature3AxisAdvanced,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.VibrationTemperature3AxisNB
    ],
    dynamicData: {
      serverDatatype: 'raw',
      title: '波形数据',
      fields: [
        { label: '加速度时域', value: 'accelerationTimeDomain', unit: 'm/s²' },
        { label: '加速度频域', value: 'accelerationFrequencyDomain', unit: 'm/s²' },
        { label: '速度时域', value: 'velocityTimeDomain', unit: 'mm/s' },
        { label: '速度频域', value: 'velocityFrequencyDomain', unit: 'mm/s' },
        { label: '位移时域', value: 'displacementTimeDomain', unit: 'μm' },
        { label: '位移频域', value: 'displacementFrequencyDomain', unit: 'μm' }
      ],
      metaData: []
    }
  },
  angleDip: {
    id: 10501,
    label: '倾角',
    url: '/bolt',
    firstClassFieldKeys: ['inclination', 'pitch', 'roll', 'waggle'],
    deviceType: [DeviceType.AngleDip]
  },
  pressure: {
    id: 10601,
    label: '压力',
    url: '/bolt',
    firstClassFieldKeys: ['pressure', 'temperature'],
    deviceType: [DeviceType.PressureTemperature]
  },
  flangePreload: {
    id: 10311,
    label: '法兰预紧力',
    url: '/bolt',
    firstClassFieldKeys: ['preload', 'pressure', 'tof', 'temperature'],
    deviceType: [DeviceType.BoltElongation],
    hidden: true
  }
};
