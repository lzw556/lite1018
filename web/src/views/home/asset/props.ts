export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
};

export type AssetRow = {
  ID: number;
  Name: string;
  Type: number;
  ParentID: number;
  ProjectID: number;
};

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return { id: values.ID, name: values.Name, parent_id: values.ParentID, type: values.Type };
}
