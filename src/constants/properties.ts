export interface DisplayProperty {
  key: string;
  name: string;
  first?: boolean;
  precision: number;
  unit?: string;
  unit2?: string;
  losingOnMonitoringPoint?: boolean;
  interval?: number;
  fields?: { name: string; key: string; dataIndex: number; first?: boolean }[];
  defaultFirstFieldKey?: string;
  parentKey?: string;
}

export type DisplayPropertyCategories = {
  [key in
    | 'SA'
    | 'SAS'
    | 'DS'
    | 'DC_NORMAL'
    | 'DC_HIGH'
    | 'SVT210R'
    | 'SVT220520'
    | 'SVT210510'
    | 'SVT110'
    | 'SVT210RS'
    | 'SVT220S1S3'
    | 'ST'
    | 'SPT'
    | 'SQ'
    | 'TOWER']: readonly DisplayProperty[];
};

//generic properties start
const TEMPERATURE: DisplayProperty = {
  key: 'temperature',
  name: 'FIELD_TEMPERATURE',
  first: true,
  precision: 1,
  unit: '℃',
  unit2: '°C'
};
const ENVIRONMENT_TEMPERATURE: DisplayProperty = {
  key: 'temperature',
  name: 'FIELD_ENVIRONMENT_TEMPERATURE',
  precision: 1,
  unit: '℃',
  unit2: '°C'
};
const TOF: DisplayProperty = {
  key: 'tof',
  name: 'FIELD_TOF',
  precision: 0,
  unit: 'ns'
};
const SIGNAL_STRENGTH: DisplayProperty = {
  key: 'signal_strength',
  name: 'FIELD_SIGNAL_STRENGTH',
  precision: 1
};
const SIGNAL_QUALITY: DisplayProperty = {
  key: 'signal_quality',
  name: 'FIELD_SIGNAL_QUALITY',
  precision: 1
};
const INCLINATION: DisplayProperty = {
  key: 'inclination',
  name: 'FIELD_INCLINATION',
  precision: 4,
  unit: '°'
};
const PITCH: DisplayProperty = {
  key: 'pitch',
  name: 'FIELD_PITCH',
  precision: 4,
  unit: '°'
};
const ROLL: DisplayProperty = {
  key: 'roll',
  name: 'FIELD_ROLL',
  precision: 4,
  unit: '°'
};
const WAGGLE: DisplayProperty = { key: 'waggle', name: 'FIELD_WAGGLE', precision: 3, unit: 'g' };
//generic properties end

//DC specific start
const THICKNESS: DisplayProperty = {
  key: 'thickness',
  name: 'FIELD_THICKNESS',
  first: true,
  interval: 0.02,
  precision: 3,
  unit: 'mm'
};
// const CORROSION_RATE: DisplayProperty = {
//   key: 'corrosion_rate',
//   name: 'FIELD_CORROSION_RATE',
//   precision: 3,
//   losingOnMonitoringPoint: true,
//   unit: 'mm/a'
// };
const DC_TEMPERATURE: DisplayProperty = {
  key: 'temperature',
  name: 'FIELD_TEMPERATURE',
  first: true,
  precision: 1,
  unit: '℃',
  unit2: '°C',
  fields: [{ key: 'temperature', name: 'FIELD_TEMPERATURE', dataIndex: 0 }],
  parentKey: 'temperature'
};
const DC_TEMPERATURE_ENV: DisplayProperty = {
  key: 'env_temperature',
  name: 'FIELD_ENVIRONMENT_TEMPERATURE',
  first: true,
  precision: 1,
  unit: '℃',
  unit2: '°C',
  fields: [{ key: 'env_temperature', name: 'FIELD_ENVIRONMENT_TEMPERATURE', dataIndex: 0 }],
  parentKey: 'temperature'
};
const SHORT_TERM_CORROSION_RATE: DisplayProperty = {
  key: 'short_term_corrosion_rate',
  name: 'FIELD_SHORT_TERM_CORROSION_RATE',
  first: true,
  precision: 3,
  // losingOnMonitoringPoint: true,
  unit: 'mm/a',
  fields: [
    { key: 'short_term_corrosion_rate', name: 'FIELD_SHORT_TERM_CORROSION_RATE', dataIndex: 0 }
  ],
  parentKey: 'corrosion_rate'
};
const LONG_TERM_CORROSION_RATE: DisplayProperty = {
  key: 'long_term_corrosion_rate',
  name: 'FIELD_LONG_TERM_CORROSION_RATE',
  first: true,
  precision: 3,
  // losingOnMonitoringPoint: true,
  unit: 'mm/a',
  fields: [
    { key: 'long_term_corrosion_rate', name: 'FIELD_LONG_TERM_CORROSION_RATE', dataIndex: 0 }
  ],
  parentKey: 'corrosion_rate'
};
//DC specific end

//SVT specific start
const VELOCITY_RMS: DisplayProperty = {
  key: 'vibration_severity',
  name: 'FIELD_VELOCITY_RMS',
  precision: 3,
  first: true,
  unit: 'mm/s'
};
const ACCLERATION_ENVELOPE: DisplayProperty = {
  key: 'enveloping_pk2pk',
  name: 'FIELD_ACCLERATION_ENVELOPE',
  precision: 3,
  first: true,
  unit: 'gE'
};
const ACCELERATION_RMS: DisplayProperty = {
  key: 'acceleration_rms',
  name: 'FIELD_ACCELERATION_RMS',
  precision: 3,
  unit: 'm/s²'
};
const ACCLERATION_PEAK: DisplayProperty = {
  key: 'acceleration_peak',
  name: 'FIELD_ACCLERATION_PEAK',
  precision: 3,
  unit: 'm/s²'
};
const DISPLACEMENT_PEAK_TO_PEAK: DisplayProperty = {
  key: 'displacement_peak_difference',
  name: 'FIELD_DISPLACEMENT_PEAK_TO_PEAK',
  precision: 3,
  unit: 'μm'
};
const DISPLACEMENT_RMS: DisplayProperty = {
  key: 'displacement',
  name: 'FIELD_DISPLACEMENT_RMS',
  precision: 3,
  unit: 'μm'
};
const FREQUENCY: DisplayProperty = {
  key: 'fft_frequency',
  name: 'FIELD_FREQUENCY',
  precision: 1,
  unit: 'Hz'
};
const CREST_FACTOR: DisplayProperty = {
  key: 'crest_factor',
  name: 'FIELD_CREST_FACTOR',
  precision: 3
};
const PULSE_FACTOR: DisplayProperty = {
  key: 'pulse_factor',
  name: 'FIELD_PULSE_FACTOR',
  precision: 3
};
const MARGIN_FACTOR: DisplayProperty = {
  key: 'margin_factor',
  name: 'FIELD_MARGIN_FACTOR',
  precision: 3
};
const KURTOSIS: DisplayProperty = {
  key: 'kurtosis',
  name: 'FIELD_KURTOSIS',
  precision: 3
};
const KURTOSIS_NORM: DisplayProperty = {
  key: 'kurtosis_norm',
  name: 'FIELD_KURTOSIS_NORM',
  precision: 3
};
const SKWENESS: DisplayProperty = {
  key: 'skewness',
  name: 'FIELD_SKWENESS',
  precision: 3
};
const SKWENESS_NORM: DisplayProperty = {
  key: 'skewness_norm',
  name: 'FIELD_SKWENESS_NORM',
  precision: 3
};
const HALF_HARMONIC: DisplayProperty = {
  key: 'fft_value_0',
  name: 'FIELD_HALF_HARMONIC',
  precision: 3,
  unit: 'm/s²'
};
const FIRST_HARMONIC: DisplayProperty = {
  key: 'fft_value_1',
  name: 'FIELD_FIRST_HARMONIC',
  precision: 3,
  unit: 'm/s²'
};
const SECOND_HARMONIC: DisplayProperty = {
  key: 'fft_value_2',
  name: 'FIELD_SECOND_HARMONIC',
  precision: 3,
  unit: 'm/s²'
};
const THIRD_HARMONIC: DisplayProperty = {
  key: 'fft_value_3',
  name: 'FIELD_THIRD_HARMONIC',
  precision: 3,
  unit: 'm/s²'
};
const VARIANCE: DisplayProperty = {
  key: 'acc_var',
  name: 'FIELD_VARIANCE',
  precision: 3
};
const SPECTRUM_VARIANCE: DisplayProperty = {
  key: 'spectrum_variance',
  name: 'FIELD_SPECTRUM_VARIANCE',
  precision: 3
};
const SPECTRUM_MEAN: DisplayProperty = {
  key: 'spectrum_mean',
  name: 'FIELD_SPECTRUM_MEAN',
  precision: 3
};
const PPECTRUM_RMS: DisplayProperty = {
  key: 'spectrum_rms',
  name: 'FIELD_PPECTRUM_RMS',
  precision: 3
};
const RPM: DisplayProperty = {
  key: 'rpm',
  name: 'FIELD_RPM',
  precision: 3
};
//SVT specific end

//tower start
const DISPLACEMENT_COMBINED: DisplayProperty = {
  key: 'displacement_combined',
  first: true,
  name: 'FIELD_DISPLACEMENT_COMBINED',
  precision: 3,
  unit: 'mm',
  defaultFirstFieldKey: 'displacement_radial'
};
const INCLINATION_COMBINED: DisplayProperty = {
  key: 'inclination_combined',
  first: true,
  name: 'FIELD_INCLINATION_COMBINED',
  precision: 4,
  unit: '°',
  defaultFirstFieldKey: 'inclination_radial'
};
const DIRECTION: DisplayProperty = {
  key: 'direction',
  first: true,
  name: 'FIELD_DIRECTION',
  precision: 3,
  unit: '°'
};
//tower end

const SAS: DisplayProperty[] = [
  {
    key: 'preload',
    name: 'FIELD_PRELOAD',
    first: true,
    interval: 20,
    precision: 0,
    unit: 'kN'
  },
  {
    key: 'pressure',
    name: 'FIELD_STRESS',
    first: true,
    interval: 20,
    precision: 0,
    unit: 'MPa'
  },
  {
    key: 'length',
    name: 'FIELD_LENGTH',
    interval: 1,
    precision: 1,
    unit: 'mm'
  },
  { ...TEMPERATURE, key: 'bolt_temperature', name: 'FIELD_BOLT_TEMPERATURE' },
  { ...TOF, interval: 600 },
  {
    key: 'defect_location',
    name: 'FIELD_DEFECT_LOCATION',
    precision: 3,
    unit: 'mm'
  },
  {
    key: 'defect_level',
    name: 'FIELD_DEFECT_LEVEL',
    precision: 3
  },
  SIGNAL_STRENGTH,
  SIGNAL_QUALITY,
  {
    key: 'attitude',
    name: 'FIELD_BOLT_ATTITUDE',
    precision: 3,
    unit: 'g'
  }
];

const SVT210R = [
  VELOCITY_RMS,
  ACCLERATION_ENVELOPE,
  TEMPERATURE,
  ACCELERATION_RMS,
  ACCLERATION_PEAK,
  DISPLACEMENT_PEAK_TO_PEAK,
  DISPLACEMENT_RMS,
  FREQUENCY,
  CREST_FACTOR,
  PULSE_FACTOR,
  MARGIN_FACTOR,
  KURTOSIS,
  KURTOSIS_NORM,
  SKWENESS,
  SKWENESS_NORM,
  HALF_HARMONIC,
  FIRST_HARMONIC,
  SECOND_HARMONIC,
  THIRD_HARMONIC,
  VARIANCE,
  SPECTRUM_VARIANCE,
  SPECTRUM_MEAN,
  PPECTRUM_RMS,
  INCLINATION,
  PITCH,
  ROLL
];

export const PROPERTY_CATEGORIES: DisplayPropertyCategories = {
  SAS,
  SA: [
    {
      key: 'loosening_angle',
      name: 'FIELD_LOOSENING_ANGLE',
      first: true,
      precision: 1,
      interval: 0.5,
      unit: '°'
    },
    {
      key: 'measurement_index',
      name: 'FIELD_MEASUREMENT_INDEX',
      precision: 3
    },
    {
      key: 'motion',
      name: 'FIELD_MOTION',
      precision: 3
    },
    {
      key: 'attitude',
      name: 'FIELD_ATTITUDE_INDEX',
      precision: 4
    },
    ENVIRONMENT_TEMPERATURE
  ],
  DS: SAS.slice(0, SAS.length - 1),
  DC_NORMAL: [
    THICKNESS,
    DC_TEMPERATURE,
    TOF,
    SHORT_TERM_CORROSION_RATE,
    LONG_TERM_CORROSION_RATE,
    { ...SIGNAL_STRENGTH, losingOnMonitoringPoint: true },
    { ...SIGNAL_QUALITY, losingOnMonitoringPoint: true }
  ],
  DC_HIGH: [
    THICKNESS,
    DC_TEMPERATURE,
    DC_TEMPERATURE_ENV,
    TOF,
    SHORT_TERM_CORROSION_RATE,
    LONG_TERM_CORROSION_RATE,
    { ...SIGNAL_STRENGTH, losingOnMonitoringPoint: true },
    { ...SIGNAL_QUALITY, losingOnMonitoringPoint: true }
  ],
  SVT210R,
  SVT210510: SVT210R,
  SVT110: SVT210R,
  SVT220520: SVT210R,
  SVT210RS: [
    VELOCITY_RMS,
    ACCLERATION_ENVELOPE,
    TEMPERATURE,
    ACCLERATION_PEAK,
    DISPLACEMENT_PEAK_TO_PEAK
  ],
  SVT220S1S3: [
    VELOCITY_RMS,
    ACCLERATION_ENVELOPE,
    TEMPERATURE,
    ACCLERATION_PEAK,
    DISPLACEMENT_PEAK_TO_PEAK,
    FREQUENCY,
    RPM
  ],
  ST: [TEMPERATURE],
  SPT: [{ key: 'pressure', name: 'FIELD_PRESSURE2', precision: 1, unit: 'MPa' }, TEMPERATURE],
  SQ: [
    { ...INCLINATION, first: true },
    { ...PITCH, first: true },
    { ...ROLL, first: true },
    WAGGLE
  ],
  TOWER: [DISPLACEMENT_COMBINED, INCLINATION_COMBINED, DIRECTION, WAGGLE]
} as const;
