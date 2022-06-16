import { Device } from '../../../types/device';

export type Measurement = {
  id: number;
  name: string;
  type: number;
  asset_id: number;
  device_id?: number;
  attributes?: { index: number };
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
  bindingDevices?: Device[];
  attributes?: { index: number };
  assetName: string;
  properties: Property[];
  data?: {
    timestamp: number;
    values: { [propName: string]: number };
  };
};

export function convertRow(values?: MeasurementRow): Measurement | null {
  if (!values) return null;
  return {
    id: values.id,
    name: values.name,
    type: values.type,
    asset_id: values.assetId,
    device_id:
      values.bindingDevices && values.bindingDevices.length > 0
        ? values.bindingDevices[0].id
        : undefined,
    attributes: values.attributes
  };
}

export type AlarmRule = {
  id: number;
  name: string;
  description: string;
  category: number;
  type: number;
  rules: {
    id: number;
    name: string;
    description: string;
    index?: any;
    duration: number;
    operation: string;
    threshold: number;
    level: number;
    source_type?: number;
    category: number;
    metric: any;
  }[];
  monitoringPoints?: MeasurementRow[];
  bindedStatus?: boolean;
  bindingStatus?: boolean;
};
