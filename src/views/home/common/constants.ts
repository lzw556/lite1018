import { DeviceType } from '../../../types/device_type';
import { DataType } from '../summary/measurement/contentTabs/dynamicDataHelper';
import intl from 'react-intl-universal';

export const AssetViews = ['WindTurbineOverview', 'FlangeOverview', 'BoltOverview'];

export const measurementTypes: Record<
  | 'loosening_angle'
  | 'preload'
  | 'thickness'
  | 'vibration'
  | 'angleDip'
  | 'pressure'
  | 'flangePreload'
  | 'temperature',
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
    label: 'FIELD_LOOSENING_ANGLE',
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
    label: 'FIELD_PRELOAD',
    url: '/bolt',
    firstClassFieldKeys: ['preload', 'pressure', 'tof', 'temperature'],
    deviceType: [DeviceType.BoltElongation, DeviceType.BoltElongationMultiChannels],
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
  },
  thickness: {
    id: 10201,
    label: 'FIELD_THICKNESS',
    url: '/bolt',
    firstClassFieldKeys: ['thickness', 'temperature', 'annualized_corrosion_rate'],
    deviceType: [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion],
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
  },
  vibration: {
    id: 10401,
    label: 'VIBRATION',
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
      title: 'WAVEFORM_DATA',
      fields: [
        {
          label: 'FIELD_ACCELERATION_TIME_DOMAIN',
          value: 'accelerationTimeDomain',
          unit: 'm/s²'
        },
        {
          label: 'FIELD_ACCELERATION_FREQUENCY_DOMAIN',
          value: 'accelerationFrequencyDomain',
          unit: 'm/s²'
        },
        {
          label: 'FIELD_VELOCITY_TIME_DOMAIN',
          value: 'velocityTimeDomain',
          unit: 'mm/s'
        },
        {
          label: 'FIELD_VELOCITY_FREQUENCY_DOMAIN',
          value: 'velocityFrequencyDomain',
          unit: 'mm/s'
        },
        {
          label: 'FIELD_DISPLACEMENT_TIME_DOMAIN',
          value: 'displacementTimeDomain',
          unit: 'μm'
        },
        {
          label: 'FIELD_DISPLACEMENT_FREQUENCY_DOMAIN',
          value: 'displacementFrequencyDomain',
          unit: 'μm'
        }
      ],
      metaData: []
    }
  },
  angleDip: {
    id: 10501,
    label: 'FIELD_INCLINATION',
    url: '/bolt',
    firstClassFieldKeys: ['inclination', 'pitch', 'roll', 'waggle'],
    deviceType: [DeviceType.AngleDip]
  },
  pressure: {
    id: 10601,
    label: 'FIELD_PRESSURE',
    url: '/bolt',
    firstClassFieldKeys: ['pressure', 'temperature'],
    deviceType: [DeviceType.PressureTemperature]
  },
  flangePreload: {
    id: 10311,
    label: 'FLANGE_PRELOAD',
    url: '/bolt',
    firstClassFieldKeys: ['preload', 'pressure', 'tof', 'temperature'],
    deviceType: [DeviceType.BoltElongation],
    hidden: true
  },
  temperature: {
    id: 10801,
    label: 'FIELD_TEMPERATURE',
    url: '/bolt',
    firstClassFieldKeys: ['temperature'],
    deviceType: [DeviceType.Temperature]
  }
};
