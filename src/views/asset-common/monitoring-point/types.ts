import { Device } from '../../../types/device';

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
    axial?: string;
    horizontal?: string;
    vertical?: string;
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

export type HistoryData = {
  timestamp: number;
  values: Property[];
}[];

export type DataType = 'raw' | 'waveform';

export type VibrationAnalysisParams = {
  fs?: number;
  full_scale?: number;
  range?: number;
  window?: string;
  cutoff_range_low?: number;
  cutoff_range_high?: number;
  filter_type?: number;
  filter_order?: number;
  f_h?: number;
  f_l?: number;
  scale?: number;
  window_length?: number;
};

export type VibrationAnalysisRequest = {
  data: number[];
  property: string;
} & VibrationAnalysisParams;

export type MonitoringPointBatch = {
  asset_id: number;
  type: number;
  monitoring_points: (MonitoringPointInfo & {
    type: number;
  })[];
};
export type MonitoringPointInfo = {
  name: string;
  dev_id: number;
  dev_name: string;
  dev_type: number;
  channel?: number;
  attributes?: any;
};

export type Metadata = { [key: string]: number };
