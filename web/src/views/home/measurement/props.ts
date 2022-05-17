export type Measurement = {
  id: number;
  name: string;
  type: number;
  asset_id: number;
};

export type MeasurementRow = {
  ID: number;
  Name: string;
  Type: number;
  AssetID: number;
};

export function convertRow(values?: MeasurementRow): Measurement | null {
  if (!values) return null;
  return { id: values.ID, name: values.Name, type: values.Type, asset_id: values.AssetID };
}
