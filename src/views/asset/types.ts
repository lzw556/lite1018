import { MonitoringPointRow } from '../monitoring-point';

export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
  attributes?: {
    index: number;
    type: number;
    normal?: { enabled: boolean; value: number | string };
    initial?: { enabled: boolean; value: number | string };
    info?: { enabled: boolean; value: number | string };
    warn?: { enabled: boolean; value: number | string };
    danger?: { enabled: boolean; value: number | string };
    sub_type: number;
    monitoring_points_num: number;
    sample_period: number;
    sample_time_offset: number;
    initial_preload: number;
    initial_pressure: number;
  };
};

export type AssetRow = {
  id: number;
  name: string;
  type: number;
  parentId: number;
  projectId: number;
  monitoringPoints?: MonitoringPointRow[];
  children?: AssetRow[];
  label: React.ReactNode;
  value: string | number;
  statistics: AssetChildrenStatistics;
  alertLevel: number;
  attributes?: {
    index: number;
    type: number;
    normal?: { enabled: boolean; value: number | string };
    initial?: { enabled: boolean; value: number | string };
    info?: { enabled: boolean; value: number | string };
    warn?: { enabled: boolean; value: number | string };
    danger?: { enabled: boolean; value: number | string };
    sub_type: number;
    monitoring_points_num: number;
    sample_period: number;
    sample_time_offset: number;
    initial_preload: number;
    initial_pressure: number;
  };
};

export type AssetTreeNode = (Omit<AssetRow, 'children'> | MonitoringPointRow) & {
  children: (AssetRow | (Omit<MonitoringPointRow, 'id'> & { id: string | number }))[];
};

export type AssetChildrenStatistics = {
  alarmNum: [number, number, number] | null;
  assetId: number;
  deviceNum: number;
  monitoringPointNum: number;
  offlineDeviceNum: number;
};

export enum AssetCategoryKey {
  GENERAL = 100,
  WIND_TURBINE = 101,
  FLANGE = 102,
  TOWER = 103,
  HYDRO_TURBINE = 111,
  AREA = 201,
  SUB_AREA = 202,
  PIPE = 221,
  TANK = 222,
  AREA_ASSET = 9990,
  VIBRATION_MOTOR = 351
}

export function isAssetCategoryKey(key?: number) {
  if (key === undefined) return false;
  return Object.values(AssetCategoryKey)
    .filter((v) => Number.isInteger(v))
    .includes(key);
}

export enum AssertOfAssetCategory {
  IS_ASSET,
  IS_WIND_LIKE,
  IS_FLANGE,
  IS_AREA,
  IS_PIPE,
  IS_AREA_ASSET,
  IS_GENERAL,
  IS_TOWER,
  IS_VIBRATION
}

export function AssertAssetCategory(key: number | undefined, assert: AssertOfAssetCategory) {
  switch (assert) {
    case AssertOfAssetCategory.IS_ASSET:
      return isAssetCategoryKey(key);
    case AssertOfAssetCategory.IS_WIND_LIKE:
      return key === AssetCategoryKey.WIND_TURBINE || key === AssetCategoryKey.HYDRO_TURBINE;
    case AssertOfAssetCategory.IS_FLANGE:
      return key === AssetCategoryKey.FLANGE;
    case AssertOfAssetCategory.IS_AREA:
      return key === AssetCategoryKey.AREA;
    case AssertOfAssetCategory.IS_PIPE:
      return key === AssetCategoryKey.TANK || key === AssetCategoryKey.PIPE;
    case AssertOfAssetCategory.IS_AREA_ASSET:
      return key === AssetCategoryKey.AREA_ASSET;
    case AssertOfAssetCategory.IS_GENERAL:
      return key === AssetCategoryKey.GENERAL;
    case AssertOfAssetCategory.IS_TOWER:
      return key === AssetCategoryKey.TOWER;
    case AssertOfAssetCategory.IS_VIBRATION:
      return key === AssetCategoryKey.VIBRATION_MOTOR;
    default:
      return false;
  }
}

export enum AssetCategoryLabel {
  GENERAL = 'ASSET',
  WIND_TURBINE = 'WIND_TURBINE',
  FLANGE = 'FLANGE',
  TOWER = 'TOWER',
  HYDRO_TURBINE = 'HYDRO_TURBINE',
  AREA = 'AREA',
  SUB_AREA = 'SUB_AREA',
  PIPE = 'PIPE',
  TANK = 'TANK',
  VIBRATION_MOTOR = 'VIBRATION_MOTOR'
}

export type AssetCategoryDic = {
  key: AssetCategoryKey | undefined;
  label: AssetCategoryLabel;
};
export type AssetCategoryChain = AssetCategoryDic & {
  isLeaf?: boolean;
  isChild?: boolean;
  group?: AssetCategoryDic;
};

export const ASSET_PATHNAME = 'assets';

export const VIRTUAL_ROOT_ASSET = {
  id: 0,
  type: 0,
  name: 'ASSET_LIST'
};
