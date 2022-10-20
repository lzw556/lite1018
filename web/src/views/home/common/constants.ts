import { DeviceType } from '../../../types/device_type';

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
