import { DeviceType } from '../types/device_type';
import { AssetCategoryChain } from '../views/asset';
import { AppConfigType, useAppConfigContext } from '../views/asset/components/appConfigContext';
import { MonitoringPointType } from '../views/monitoring-point';
import * as Corrosion from './corrosion.config';
import * as General from './general.config';
import * as Hydro from './hydro.config';
import * as Wind from './wind.config';
import * as CorrosionWirelessHart from './corrosionWirelessHart.config';
import * as WindPro from './windpro.config';
import * as Vibration from './vibration.config';

export const SITE_NAMES: Map<AppConfigType, string> = new Map([
  ['corrosion', Corrosion.SITE_NAME],
  ['corrosionWirelessHART', CorrosionWirelessHart.SITE_NAME],
  ['general', General.SITE_NAME],
  ['hydroTurbine', Hydro.SITE_NAME],
  ['windTurbine', Wind.SITE_NAME],
  ['windTurbinePro', WindPro.SITE_NAME],
  ['vibration', Vibration.SITE_NAME]
]);

export const SENSORS: Map<AppConfigType, DeviceType[]> = new Map([
  ['corrosion', Corrosion.SENSORS],
  ['corrosionWirelessHART', CorrosionWirelessHart.SENSORS],
  ['general', General.SENSORS],
  ['hydroTurbine', Hydro.SENSORS],
  ['windTurbine', Wind.SENSORS],
  ['windTurbinePro', WindPro.SENSORS],
  ['vibration', Vibration.SENSORS]
]);

export const MONITORING_POINTS: Map<AppConfigType, MonitoringPointType[]> = new Map([
  ['corrosion', Corrosion.MONITORING_POINTS],
  ['corrosionWirelessHART', CorrosionWirelessHart.MONITORING_POINTS],
  ['general', General.MONITORING_POINTS],
  ['hydroTurbine', Hydro.MONITORING_POINTS],
  ['windTurbine', Wind.MONITORING_POINTS],
  ['windTurbinePro', WindPro.MONITORING_POINTS],
  ['vibration', Vibration.MONITORING_POINTS]
]);

export const ASSET_CATEGORY_CHAINS: Map<AppConfigType, AssetCategoryChain[]> = new Map([
  ['corrosion', Corrosion.ASSET_CATEGORY_CHAIN],
  ['corrosionWirelessHART', CorrosionWirelessHart.ASSET_CATEGORY_CHAIN],
  ['general', General.ASSET_CATEGORY_CHAIN],
  ['hydroTurbine', Hydro.ASSET_CATEGORY_CHAIN],
  ['windTurbine', Wind.ASSET_CATEGORY_CHAIN],
  ['windTurbinePro', WindPro.ASSET_CATEGORY_CHAIN],
  ['vibration', Vibration.ASSET_CATEGORY_CHAIN]
]);

export function useAssetCategoryChain() {
  const config = useAppConfigContext();
  const chain = ASSET_CATEGORY_CHAINS.get(config.type) || [];
  const root = chain?.[0];
  const last = chain?.filter((c) => c.isLeaf === true);
  const isLeaf = (key: number) => chain.find((c) => c.key === key)?.isLeaf;
  const isChild = (key: number | undefined) => chain.find((c) => c.key === key)?.isChild;
  return { chain, root, last, isLeaf, isChild };
}
