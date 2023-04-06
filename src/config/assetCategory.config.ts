import { DeviceType } from '../types/device_type';
import { AssetCategoryChain } from '../views/asset';
import { AppConfig, useAppConfigContext } from '../views/asset/components/appConfigContext';
import { MonitoringPointType } from '../views/monitoring-point';
import * as Corrosion from './corrosion.config';
import * as General from './general.config';
import * as Hydro from './hydro.config';
import * as Wind from './wind.config';

export const SITE_NAMES: Map<AppConfig, string> = new Map([
  ['corrosion', Corrosion.SITE_NAME],
  ['general', General.SITE_NAME],
  ['hydroTurbine', Hydro.SITE_NAME],
  ['windTurbine', Wind.SITE_NAME]
]);

export const SENSORS: Map<AppConfig, DeviceType[]> = new Map([
  ['corrosion', Corrosion.SENSORS],
  ['general', General.SENSORS],
  ['hydroTurbine', Hydro.SENSORS],
  ['windTurbine', Wind.SENSORS]
]);

export const MONITORING_POINTS: Map<AppConfig, MonitoringPointType[]> = new Map([
  ['corrosion', Corrosion.MONITORING_POINTS],
  ['general', General.MONITORING_POINTS],
  ['hydroTurbine', Hydro.MONITORING_POINTS],
  ['windTurbine', Wind.MONITORING_POINTS]
]);

export const MENUS_HIDDEN: Map<AppConfig, string[]> = new Map([
  ['corrosion', Corrosion.MENUS_HIDDEN],
  ['general', General.MENUS_HIDDEN],
  ['hydroTurbine', Hydro.MENUS_HIDDEN],
  ['windTurbine', Wind.MENUS_HIDDEN]
]);

export const ASSET_CATEGORY_CHAINS: Map<AppConfig, AssetCategoryChain[]> = new Map([
  ['corrosion', Corrosion.ASSET_CATEGORY_CHAIN],
  ['general', General.ASSET_CATEGORY_CHAIN],
  ['hydroTurbine', Hydro.ASSET_CATEGORY_CHAIN],
  ['windTurbine', Wind.ASSET_CATEGORY_CHAIN]
]);

export function useAssetCategoryChain() {
  const config = useAppConfigContext();
  const chain = ASSET_CATEGORY_CHAINS.get(config) || [];
  const root = chain?.[0];
  const last = chain?.[chain.length - 1];
  const isLeaf = (key: number) => chain.find((c) => c.key === key)?.isLeaf;
  const isChild = (key: number) => chain.find((c) => c.key === key)?.isChild;
  return { chain, root, last, isLeaf, isChild };
}
