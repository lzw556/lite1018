import * as Wind from './wind.config';
import { DeviceType } from '../types/device_type';

export function use(appCate: typeof window.assetCategory = 'default') {
  let devTypes: { val: number; name: string }[] = Object.values(DeviceType)
    .filter((val) => Number.isInteger(val)) //DeviceType above not only enum, also namespace; so need to filter items not real type
    .map((val) => ({
      val: Number(val),
      name: DeviceType.toString(Number(val))
    }));
  let sensorTypes = DeviceType.sensors();
  let site = { name: '云监控平台' };
  let topAsset = {
    name: '资产'
  };
  if (appCate === Wind.category) {
    devTypes = devTypes.filter(({ val }) => Object.values(Wind.DeviceType).includes(val));
    sensorTypes = Wind.sensors;
    site = Wind.site;
    topAsset = Wind.topAsset;
  }
  return {
    devTypes,
    sensorTypes,
    site,
    topAsset
  };
}
