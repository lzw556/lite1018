import intl from 'react-intl-universal';

export const DYNAMIC_DATA_BOLTELONGATION = {
  data_type: 1073872901,
  fields: [
    { label: intl.get('FIELD_PRELOAD'), value: 'dynamic_preload', unit: 'kN' },
    { label: intl.get('FIELD_PRESSURE'), value: 'dynamic_pressure', unit: 'MPa' },
    { label: intl.get('FIELD_LENGTH'), value: 'dynamic_length', unit: 'mm' },
    { label: intl.get('FIELD_TOF'), value: 'dynamic_tof', unit: 'ns' },
    { label: intl.get('FIELD_ACCELERATION'), value: 'dynamic_acceleration', unit: 'g' }
  ] as const,
  metaData: [
    { label: intl.get('FIELD_PRELOAD'), value: 'min_preload', unit: 'kN' },
    { label: intl.get('FIELD_PRESSURE'), value: 'min_length', unit: 'mm' },
    { label: intl.get('FIELD_TEMPERATURE'), value: 'temperature', unit: '℃' },
    { label: intl.get('FIELD_TOF'), value: 'min_tof', unit: 'ns' },
    { label: intl.get('FIELD_DEFECT_LOCATION'), value: 'defect_location', unit: 'mm' }
  ] as const
};

export const AXIS_THREE = [
  { label: intl.get('AXIS_X'), value: 'xAxis' },
  { label: intl.get('AXIS_Y'), value: 'yAxis' },
  { label: intl.get('AXIS_Z'), value: 'zAxis' }
] as const;

export const DYNAMIC_DATA_ANGLEDIP = {
  data_type: 16842756,
  fields: [
    { label: intl.get('FIELD_INCLINATION'), value: 'dynamic_inclination', unit: '°' },
    { label: intl.get('FIELD_PITCH'), value: 'dynamic_pitch', unit: '°' },
    { label: intl.get('FIELD_ROLL'), value: 'dynamic_roll', unit: '°' }
  ] as const,
  metaData: [
    { label: intl.get('FIELD_INCLINATION'), value: 'mean_inclination', unit: '°' },
    { label: intl.get('FIELD_PITCH'), value: 'mean_pitch', unit: '°' },
    { label: intl.get('FIELD_ROLL'), value: 'mean_roll', unit: '°' }
  ] as const
};
