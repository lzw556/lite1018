import { DeviceType } from '../types/device_type';
import { AssetCategory } from '../views/asset/components/assetCategoryContext';
import { MonitoringPointType } from '../views/monitoring-point';
import * as Wind from '../views/asset/wind-turbine';
import * as General from '../views/asset/general';
import * as Hydro from '../views/asset/hydro-turbine';
import * as Corrosion from '../views/asset/corrosion';

export const SITE_NAMES: Map<AssetCategory, string> = new Map([
  ['general', General.SITE_NAME],
  ['windTurbine', Wind.SITE_NAME],
  ['hydroTurbine', Hydro.SITE_NAME],
  ['corrosion', Corrosion.SITE_NAME]
]);

export const SENSORS: Map<AssetCategory, DeviceType[]> = new Map([
  ['general', General.SENSORS],
  ['windTurbine', Wind.SENSORS],
  ['hydroTurbine', Hydro.SENSORS],
  ['corrosion', Corrosion.SENSORS]
]);

export const ROOT_ASSETS: Map<AssetCategory, number> = new Map([
  ['windTurbine', Wind.WIND_TURBINE_ASSET_TYPE_ID],
  ['hydroTurbine', Hydro.HYDRO_TURBINE_ASSET_TYPE_ID],
  ['general', General.GENERAL_ASSET_TYPE_ID],
  ['corrosion', Corrosion.AREA_ASSET_TYPE_ID]
]);

export const MONITORING_POINTS: Map<AssetCategory, MonitoringPointType[]> = new Map([
  ['general', General.MONITORING_POINTS],
  ['windTurbine', Wind.MONITORING_POINTS],
  ['hydroTurbine', Hydro.MONITORING_POINTS],
  ['corrosion', Corrosion.MONITORING_POINTS]
]);

export const MENUS_HIDDEN: Map<AssetCategory, string[]> = new Map([
  ['general', General.MENUS_HIDDEN],
  ['windTurbine', Wind.MENUS_HIDDEN],
  ['hydroTurbine', Hydro.MENUS_HIDDEN],
  ['corrosion', Corrosion.MENUS_HIDDEN]
]);
