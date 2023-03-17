import { DeviceType } from '../types/device_type';
import { AssetCategory } from '../views/asset/components/assetCategoryContext';
import {
  MonitoringPointType,
  MonitoringPointTypeText,
  MonitoringPointTypeValue
} from '../views/monitoring-point';

export const SITE_NAMES: Map<AssetCategory, string> = new Map([
  ['general', 'IoT云监控平台'],
  ['windTurbine', '风电螺栓监测系统'],
  ['hydroTurbine', '水轮机螺栓监测系统']
]);

export const SENSORS: Map<AssetCategory, DeviceType[]> = new Map([
  ['general', DeviceType.sensors()],
  [
    'windTurbine',
    [DeviceType.BoltLoosening, DeviceType.BoltElongation, DeviceType.BoltElongationMultiChannels]
  ],
  [
    'hydroTurbine',
    [DeviceType.BoltLoosening, DeviceType.BoltElongation, DeviceType.BoltElongationMultiChannels]
  ]
]);

export const ROOT_ASSETS: Map<AssetCategory, number> = new Map([
  ['windTurbine', 101],
  ['hydroTurbine', 111],
  ['general', 100]
]);

export const MONITORING_POINTS: Map<AssetCategory, MonitoringPointType[]> = new Map([
  [
    'general',
    [
      {
        id: MonitoringPointTypeValue.LOOSENING_ANGLE,
        label: MonitoringPointTypeText.LOOSENING_ANGLE
      },
      { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS },
      { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
      { id: MonitoringPointTypeValue.VIBRATION, label: MonitoringPointTypeText.VIBRATION },
      { id: MonitoringPointTypeValue.ANGLE_DIP, label: MonitoringPointTypeText.ANGLE_DIP },
      { id: MonitoringPointTypeValue.PRESSURE, label: MonitoringPointTypeText.PRESSURE },
      { id: MonitoringPointTypeValue.TEMPERATURE, label: MonitoringPointTypeText.TEMPERATURE }
    ]
  ],
  [
    'windTurbine',
    [
      {
        id: MonitoringPointTypeValue.LOOSENING_ANGLE,
        label: MonitoringPointTypeText.LOOSENING_ANGLE
      },
      { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD }
    ]
  ]
]);
