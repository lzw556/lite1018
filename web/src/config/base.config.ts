import { DeviceType } from '../types/device_type';
import { DataType } from '../views/home/summary/measurement/contentTabs/dynamicDataHelper';

export const category: typeof window.assetCategory = 'default';

export const devTypes: { val: number; name: string }[] = Object.values(DeviceType)
  .filter((val) => Number.isInteger(val)) //DeviceType above not only enum, also namespace; so need to filter items not real type
  .map((val) => ({
    val: Number(val),
    name: DeviceType.toString(Number(val))
  }));

export const sensorTypes = DeviceType.sensors();

export const site = {
  name: 'LoT云监控平台'
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
  'loosening_angle' | 'preload' | 'thickness',
  {
    id: number;
    label: string;
    url: string;
    firstClassFieldKeys: string[];
    deviceType: number[];
    dynamicData?: {
      title: string;
      serverDatatype: DataType;
      fields: { label: string; value: string; unit: string }[];
      metaData: { label: string; value: string; unit: string }[];
    };
    waveData?: {
      title: string;
      serverDatatype: DataType;
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
      serverDatatype: 'raw',
      title: '动态数据',
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
    },
    waveData: {
      serverDatatype: 'waveform',
      title: '波形数据',
      fields: [{ label: 'mv', value: 'mv', unit: '' }],
      metaData: [
        { label: '预紧力', value: 'preload', unit: 'kN' },
        { label: '应力', value: 'pressure', unit: 'MPa' },
        { label: '飞行时间', value: 'tof', unit: 'ns' },
        { label: '温度', value: 'temperature', unit: '℃' },
        { label: '长度', value: 'length', unit: 'mm' }
      ]
    }
  },
  thickness: {
    id: 10201,
    label: '厚度',
    url: '/bolt',
    firstClassFieldKeys: ['thickness', 'temperature', 'annualized_corrosion_rate'],
    deviceType: [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion],
    waveData: {
      serverDatatype: 'waveform',
      title: '波形数据',
      fields: [{ label: 'mv', value: 'mv', unit: '' }],
      metaData: [
        { label: '厚度', value: 'thickness', unit: 'mm' },
        { label: '温度', value: 'temp', unit: '℃' },
        { label: '飞行时间', value: 'tof', unit: 'ns' },
        { label: '环境温度', value: 'envTemp', unit: '℃' },
        { label: '信号强度', value: 'sigStrength', unit: '' }
      ]
    }
  }
};

export const unusedMenunames: string[] = ['measurement-management'];
