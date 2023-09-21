export const DYNAMIC_DATA_BOLTELONGATION = {
  data_type: 1073872901,
  fields: [
    { label: 'DYNAMIC_FIELD_LENGTH', value: 'dynamic_length', unit: 'mm', precision: 1 },
    { label: 'DYNAMIC_FIELD_TOF', value: 'dynamic_tof', unit: 'ns', precision: 0 },
    { label: 'DYNAMIC_FIELD_PRELOAD', value: 'dynamic_preload', unit: 'kN', precision: 0 },
    { label: 'DYNAMIC_FIELD_PRESSURE', value: 'dynamic_pressure', unit: 'MPa', precision: 0 },
    { label: 'DYNAMIC_FIELD_ACCELERATION', value: 'dynamic_acceleration', unit: 'g', precision: 3 }
  ],
  metaData: [
    { label: 'DYNAMIC_FIELD_LENGTH', value: 'min_length', unit: 'mm', precision: 1 },
    { label: 'DYNAMIC_FIELD_TOF', value: 'min_tof', unit: 'ns', precision: 0 },
    { label: 'DYNAMIC_FIELD_PRELOAD', value: 'min_preload', unit: 'kN', precision: 0 }
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
    { label: 'FIELD_INCLINATION', value: 'dynamic_inclination', unit: '°', precision: 2 },
    { label: 'FIELD_PITCH', value: 'dynamic_pitch', unit: '°', precision: 2 },
    { label: 'FIELD_ROLL', value: 'dynamic_roll', unit: '°', precision: 2 },
    { label: 'FIELD_WAGGLE', value: 'dynamic_waggle', unit: 'g', precision: 3 }
  ],
  metaData: [
    { label: 'FIELD_INCLINATION', value: 'mean_inclination', unit: '°', precision: 2 },
    { label: 'FIELD_PITCH', value: 'mean_pitch', unit: '°', precision: 2 },
    { label: 'FIELD_ROLL', value: 'mean_roll', unit: '°', precision: 2 },
    { label: 'FIELD_WAGGLE', value: 'mean_waggle', unit: 'g', precision: 3 }
  ]
};
