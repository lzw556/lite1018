export type Measurement = {
  id: number;
  name: string;
  type: number;
  asset_id: number;
};

export type MeasurementRow = {
  id: number;
  name: string;
  type: number;
  assetId: number;
};

export function convertRow(values?: MeasurementRow): Measurement | null {
  if (!values) return null;
  return { id: values.id, name: values.name, type: values.type, asset_id: values.assetId };
}
