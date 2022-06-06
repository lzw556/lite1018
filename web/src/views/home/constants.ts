import { DeviceType } from '../../types/device_type';

export const AssetTypes: Record<
  'WindTurbind' | 'Flange',
  {
    type: number;
    label: string;
    parent_id?: number;
    url: string;
    categories?: { label: string; value: number | string }[];
  }
> = {
  WindTurbind: {
    type: 2,
    label: '风机',
    parent_id: 0,
    url: '/project-overview?locale=project-overview/windturbine'
  },
  Flange: {
    type: 3,
    label: '法兰',
    url: '/project-overview?locale=project-overview/flange',
    categories: [
      { label: '塔筒', value: 1 },
      { label: '叶根', value: 2 },
      { label: '轮毂-机舱连接', value: 3 },
      { label: '变桨轴承', value: 4 }
    ]
  }
};

export const MeasurementTypes: Record<
  'loosening_angle' | 'preload' | 'dynamicPreload',
  {
    type: number;
    label: string;
    url: string;
    firstClassProperties: string[];
    deviceTypes: number[];
  }
> = {
  loosening_angle: {
    type: 10001,
    label: '松动角度',
    url: '/project-overview?locale=project-overview/bolt',
    firstClassProperties: ['loosening_angle', 'attitude', 'motion'],
    deviceTypes: [DeviceType.BoltLoosening]
  },
  preload: {
    type: 10101,
    label: '预紧力',
    url: '/project-overview?locale=project-overview/bolt',
    firstClassProperties: ['preload', 'temperature', 'pressure'],
    deviceTypes: [DeviceType.BoltElongation]
  },
  dynamicPreload: {
    type: 10102,
    label: '动态预紧力',
    url: '/project-overview?locale=project-overview/bolt',
    firstClassProperties: ['preload', 'temperature', 'pressure'],
    deviceTypes: [DeviceType.BoltElongation]
  }
};
