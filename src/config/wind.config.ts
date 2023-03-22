import * as DeviceTypeOld from '../types/device_type';
import { measurementTypes } from '../views/home/common/constants';

export const category: typeof window.assetCategory = 'wind';

export enum DeviceType {
  Gateway = 1,
  Router = 257,
  BoltLoosening = 131073,
  BoltElongation = 196609,
  BoltElongationMultiChannels = 196611
}

export const devTypes: { val: number; name: string }[] = Object.values(DeviceType)
  .filter((val) => Number.isInteger(val))
  .map((val) => ({
    val: Number(val),
    name: DeviceTypeOld.DeviceType.toString(Number(val))
  }));

export const sensorTypes = [
  DeviceType.BoltLoosening,
  DeviceType.BoltElongation,
  DeviceType.BoltElongationMultiChannels
];

export const site = {
  name: 'WIND_TURBINE_BOLT_MONITORING_SYSTEM'
  //configure logo in 'views\home\summary\windTurbine\icon.tsx'
};

export const assetType = {
  // configure icon in 'views\home\summary\windTurbine\icon.tsx'
  // not apply css but set the size of SVG(thin: 28*28; fat: 24*24)
  id: 101,
  label: 'WIND_TURBINE',
  parent_id: 0,
  url: '/windturbine',
  secondAsset: {
    id: 102,
    label: 'FLANGE',
    url: '/flange',
    categories: [
      { label: 'TOWER', value: 1 },
      { label: 'LEAF_ROOT', value: 2 },
      { label: 'HUB_ENGINE_ROOM', value: 3 },
      { label: 'PITCH_BEARING', value: 4 }
    ]
  }
};

export const ownerMeasurementTypes = [
  measurementTypes.loosening_angle,
  measurementTypes.preload,
  measurementTypes.flangePreload
];

export const unusedMenunames: string[] = [];
