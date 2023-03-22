import { DeviceType } from '../types/device_type';
import { measurementTypes } from '../views/home/common/constants';

export const category: typeof window.assetCategory = 'default';

export const devTypes: { val: number; name: string }[] = Object.values(DeviceType)
  .filter((val) => Number.isInteger(val)) //DeviceType above not only enum, also namespace; so need to filter items not real type
  .map((val) => ({
    val: Number(val),
    name: DeviceType.toString(Number(val))
  }));

export const sensorTypes = DeviceType.sensors();

export const site = {
  name: 'IOT_CLOUD_MONITORING_SYSTEM'
  //configure logo in 'views\home\summary\windTurbine\icon.tsx'
};

export const assetType = {
  id: 100,
  label: 'ASSET',
  parent_id: 0,
  url: '/asset',
  secondAsset: undefined
};

export const ownerMeasurementTypes = Object.values(measurementTypes);

export const unusedMenunames: string[] = ['measurement-management'];
