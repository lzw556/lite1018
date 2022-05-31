import { Device } from '../../../types/device';

export type Measurement = {
  id: number;
  name: string;
  type: number;
  asset_id: number;
};

export type Property = {
  key: string;
  name: string;
  precision: number;
  sort: number;
  unit: string;
  fields: { key: string; name: string; dataIndex: number; value: number }[];
  data: { [propName: string]: number };
};

export type MeasurementRow = {
  id: number;
  name: string;
  type: number;
  assetId: number;
  bindingDevices: Device[];
  attributes?: any;
  assetName: string;
  properties: Property[];
  data?: {
    timestamp: number;
    values: { [propName: string]: number };
  };
};

export function convertRow(values?: MeasurementRow): Measurement | null {
  if (!values) return null;
  return { id: values.id, name: values.name, type: values.type, asset_id: values.assetId };
}

export type MeasurementHistoryData = {
  timestamp: number;
  values: Property[];
}[];
