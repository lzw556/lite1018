import * as DeviceTypeOld from '../types/device_type';

export const category: typeof window.assetCategory = 'wind';

export enum DeviceType {
  Gateway = 1,
  Router = 257,
  BoltLoosening = 131073,
  BoltElongation = 196609
}

export const devTypes: { val: number; name: string }[] = Object.values(DeviceType)
  .filter((val) => Number.isInteger(val))
  .map((val) => ({
    val: Number(val),
    name: DeviceTypeOld.DeviceType.toString(Number(val))
  }));

export const sensorTypes = [DeviceType.BoltLoosening, DeviceType.BoltElongation];

export const site = {
  name: '风力发电螺栓监测系统'
  //configure logo in 'views\home\summary\windTurbine\icon.tsx'
};

export const assetType = {
  // configure icon in 'views\home\summary\windTurbine\icon.tsx'
  // not apply css but set the size of SVG(thin: 28*28; fat: 24*24)
  id: 101,
  label: '风机',
  parent_id: 0,
  url: '/windturbine',
  secondAsset: {
    id: 102,
    label: '法兰',
    url: '/flange',
    categories: [
      { label: '塔筒', value: 1 },
      { label: '叶根', value: 2 },
      { label: '轮毂-机舱连接', value: 3 },
      { label: '变桨轴承', value: 4 }
    ]
  }
};

export const measurementTypes: Record<
  'loosening_angle' | 'preload',
  {
    id: number;
    label: string;
    url: string;
    firstClassFieldKeys: string[];
    deviceType: number[];
    dynamicData?: {
      fields: { label: string; value: string; unit: string }[];
      metaData: { label: string; value: string; unit: string }[];
    };
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
    deviceType: [DeviceType.BoltLoosening]
  },
  preload: {
    id: 10301,
    label: '预紧力',
    url: '/bolt',
    firstClassFieldKeys: ['preload', 'pressure', 'tof', 'temperature'],
    deviceType: [DeviceType.BoltElongation],
    dynamicData: {
      fields: [
        { label: '预紧力', value: 'dynamic_preload', unit: 'kN' },
        { label: '应力', value: 'dynamic_pressure', unit: 'MPa' },
        { label: '长度', value: 'dynamic_length', unit: 'mm' },
        { label: '飞行时间', value: 'dynamic_tof', unit: 'ns' },
        { label: '加速度', value: 'dynamic_acceleration', unit: 'g' }
      ],
      metaData: [
        { label: '预紧力', value: 'min_preload', unit: 'kN' },
        { label: '长度', value: 'min_length', unit: 'mm' },
        { label: '温度', value: 'temperature', unit: '℃' },
        { label: '飞行时间', value: 'min_tof', unit: 'ns' },
        { label: '缺陷位置', value: 'defect_location', unit: 'mm' }
      ]
    }
  }
};
