export type DynamicDataType = {
  fields: { label: string; value: string; unit: string; precision: number }[];
  metaData: { label: string; value: string; unit: string; precision: number }[];
};

export type Metadata = { [key: string]: number };

export interface PreloadDynamicData {
  metadata: Metadata;
  dynamic_length: number[];
  dynamic_tof: number[];
  dynamic_preload: number[];
  dynamic_pressure: number[];
  dynamic_acceleration: {
    xAxis: number;
    yAxis: number;
    zAxis: number;
  }[];
}

export interface AngleDynamicData {
  metadata: Metadata;
  dynamic_displacement: number[];
  dynamic_displacement_radial: number[];
  dynamic_displacement_axial: number[];
  dynamic_displacement_ew: number[];
  dynamic_displacement_ns: number[];
  dynamic_direction: number[];
  dynamic_inclination_radial: number[];
  dynamic_inclination_axial: number[];
  dynamic_inclination_ew: number[];
  dynamic_inclination_ns: number[];
  dynamic_inclination: number[];
  dynamic_pitch: number[];
  dynamic_roll: number[];
  dynamic_waggle: number[];
}

export interface PreloadWaveData {
  metadata: Metadata;
  tof: number[];
  mv: number[];
}
