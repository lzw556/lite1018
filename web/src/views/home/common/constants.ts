import { DeviceType } from '../../../types/device_type';
import * as AppConfig from '../../../config';

export const AssetTypes: Record<
  'WindTurbind' | 'Flange',
  {
    id: number;
    label: string;
    parent_id?: number;
    url: string;
    categories?: { label: string; value: number }[];
  }
> = {
  WindTurbind: {
    id: 101,
    label: AppConfig.use(window.assetCategory).topAsset.name,
    parent_id: 0,
    url: '/windturbine'
  },
  Flange: {
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

export const MeasurementTypes: Record<
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

export const AssetViews = ['WindTurbineOverview', 'FlangeOverview', 'BoltOverview'];
