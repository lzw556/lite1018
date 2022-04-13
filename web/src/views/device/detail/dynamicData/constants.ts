export const DYNAMIC_DATA_BOLTELONGATION = {
  data_type: 1073872901,
  fields: [
    { label: '长度', value: 'dynamic_length', unit: 'mm' },
    { label: '预警力', value: 'dynamic_preload', unit: 'kN' },
    { label: '压强', value: 'dynamic_pressure', unit: 'MPa' },
    { label: '飞行时间', value: 'dynamic_tof', unit: 'ns' }
  ] as const
};

export const DYNAMIC_DATA_ANGLEDIP = {
  data_type: 16842756,
  fields: [
    { label: '倾斜角', value: 'dynamic_inclination', unit: '°' },
    { label: '俯仰角', value: 'dynamic_pitch', unit: '°' },
    { label: '翻滚角', value: 'dynamic_roll', unit: '°' }
  ] as const
};
