export const DYNAMIC_DATA_BOLTELONGATION = {
  data_type: 1073872901,
  fields: [
    { label: 'FIELD_PRELOAD', value: 'dynamic_preload', unit: 'kN' },
    { label: 'FIELD_PRESSURE', value: 'dynamic_pressure', unit: 'MPa' },
    { label: 'FIELD_LENGTH', value: 'dynamic_length', unit: 'mm' },
    { label: 'FIELD_TOF', value: 'dynamic_tof', unit: 'ns' },
    { label: 'FIELD_ACCELERATION', value: 'dynamic_acceleration', unit: 'g' }
  ],
  metaData: [
    { label: 'FIELD_PRELOAD', value: 'min_preload', unit: 'kN' },
    { label: 'FIELD_PRESSURE', value: 'min_length', unit: 'mm' },
    { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃' },
    { label: 'FIELD_TOF', value: 'min_tof', unit: 'ns' },
    { label: 'FIELD_DEFECT_LOCATION', value: 'defect_location', unit: 'mm' }
  ]
};

export const AXIS_THREE = [
  { label: 'AXIS_X', value: 'xAxis' },
  { label: 'AXIS_Y', value: 'yAxis' },
  { label: 'AXIS_Z', value: 'zAxis' }
];

export const DYNAMIC_DATA_ANGLEDIP = {
  data_type: 16842756,
  fields: [
    { label: 'FIELD_INCLINATION', value: 'dynamic_inclination', unit: '°' },
    { label: 'FIELD_PITCH', value: 'dynamic_pitch', unit: '°' },
    { label: 'FIELD_ROLL', value: 'dynamic_roll', unit: '°' },
    { label: 'FIELD_WAGGLE', value: 'dynamic_waggle', unit: 'g' }
  ],
  metaData: [
    { label: 'FIELD_INCLINATION', value: 'mean_inclination', unit: '°' },
    { label: 'FIELD_PITCH', value: 'mean_pitch', unit: '°' },
    { label: 'FIELD_ROLL', value: 'mean_roll', unit: '°' },
    { label: 'FIELD_WAGGLE', value: 'mean_waggle', unit: 'g' }
  ]
};
