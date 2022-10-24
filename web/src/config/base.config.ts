import { DeviceType } from '../types/device_type';

export const category: typeof window.assetCategory = 'default';

export const devTypes: { val: number; name: string }[] = Object.values(DeviceType)
  .filter((val) => Number.isInteger(val)) //DeviceType above not only enum, also namespace; so need to filter items not real type
  .map((val) => ({
    val: Number(val),
    name: DeviceType.toString(Number(val))
  }));
  
export const sensorTypes = DeviceType.sensors();

export const site = {
  name: '云监控平台'
  //configure logo in 'views\home\summary\windTurbine\icon.tsx'
};

export const assetType = {
  id: 100,
  label: '资产',
  parent_id: 0,
  url: '/asset',
  secondAsset: undefined
};

export const measurementTypes: Record<
  'loosening_angle' | 'preload',
  {
    id: number;
    label: string;
    url: string;
    firstClassFieldKeys: string[];
    deviceType: number;
  }
> = {
  loosening_angle: {
    id: 10101,
    label: '松动角度',
    url: '/bolt',
    firstClassFieldKeys: [
      'loosening_angle',
      'attitude',
      'motion',
      'temperature',
      'measurement_index'
    ],
    deviceType: DeviceType.BoltLoosening
  },
  preload: {
    id: 10301,
    label: '预紧力',
    url: '/bolt',
    firstClassFieldKeys: ['preload', 'pressure', 'tof', 'temperature'],
    deviceType: DeviceType.BoltElongation
  }
};