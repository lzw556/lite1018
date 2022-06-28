import * as React from 'react';
import { MeasurementRow } from '../summary/measurement/props';

export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
  attributes?: {
    index: number;
    type: number;
    normal?: number;
    info?: number;
    warn?: number;
    danger?: number;
  };
};

export type AssetRow = {
  id: number;
  name: string;
  type: number;
  parentId: number;
  projectId: number;
  monitoringPoints?: MeasurementRow[];
  children?: AssetRow[];
  label: React.ReactNode;
  value: string | number;
  statistics: AssetChildrenStatistics;
  attributes?: {
    index: number;
    type: number;
    normal?: number;
    info?: number;
    warn?: number;
    danger?: number;
  };
};

export type AssetChildrenStatistics = {
  alarmNum: [number, number, number] | null;
  assetId: number;
  deviceNum: number;
  monitoringPointNum: number;
  offlineDeviceNum: number;
};

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return {
    id: values.id,
    name: values.name,
    parent_id: values.parentId,
    type: values.type,
    attributes: values.attributes
  };
}