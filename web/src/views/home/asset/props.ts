import * as React from 'react';
import { MeasurementRow } from '../measurement/props';
import { AlarmState, Introduction, Overview } from '../props';

export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
};

export type AssetRow = {
  id: number;
  name: string;
  type: number;
  parentId: number;
  projectId: number;
  monitoringPoints?: MeasurementRow[];
  children?: AssetRow[];
  label: React.ReactNode;
  value: string | number;
  statistics: AssetStatistics;
};

export type AssetStatistics = {
  alarmNum: [number, number, number];
  assetId: number;
  deviceNum: number;
  monitoringPointNum: number;
  offlineDeviceNum: number;
};

export type AssetStatisticsPro = Pick<
  AssetStatistics,
  'deviceNum' | 'monitoringPointNum' | 'offlineDeviceNum'
> & {
  state: AlarmState;
} & Record<AlarmState | 'anomalous', number>;

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return { id: values.id, name: values.name, parent_id: values.parentId, type: values.type };
}

export function usePreloadChartOptions() {
  const [options, setOptions] = React.useState<any>(null);
  React.useEffect(() => {
    const data = [
      320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320,
      320
    ];
    const times = data.map((item: number, index: number) => `2022-04-${5 + index}`);

    const statisticOfPreload: any = {
      title: {
        text: '',
        left: 'center'
      },
      legend: { bottom: 0 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: times
      },
      yAxis: { type: 'value', min: 290, max: 360 },
      series: [
        {
          type: 'line',
          name: '1号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '2号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '3号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '4号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '5号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '6号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '7号螺栓',
          data: [329, 328, 321, 325, 325, 329, 320, 328, 335, 328, 312, 311, 310, 330, 333]
        },
        {
          type: 'line',
          name: '8号螺栓',
          data: [334, 318, 331, 325, 335, 329, 330, 328, 335, 318, 312, 311, 310, 340, 333]
        }
      ]
    };
    setOptions(statisticOfPreload);
  }, []);
  return options;
}

export function transformAssetStatistics(
  statis: AssetStatistics,
  hiddens?: (keyof AssetStatistics)[]
): Overview['statistics'] {
  const groups: Overview['statistics'] = [];
  let key: keyof AssetStatistics;
  for (key in statis) {
    if (hiddens?.find((_key) => _key === key)) break;
    const name = mapProperty(key);
    let value = statis[key];
    if (typeof name === 'string' && typeof value === 'number') {
      groups.push({ name, value });
    } else if (Array.isArray(name) && typeof value === 'object') {
      name.forEach((name, index) => {
        if (index === 0) {
          groups.push({ name, value: getAlarmStateOfAsset(statis.alarmNum) });
        } else {
          groups.push({ name, value: (value as [number, number, number])[index] });
        }
      });
    }
  }
  return groups;
}
function mapProperty(propertyName: keyof AssetStatistics) {
  switch (propertyName) {
    case 'deviceNum':
      return '传感器';
    case 'monitoringPointNum':
      return '监测点';
    case 'offlineDeviceNum':
      return '离线传感器';
    case 'alarmNum':
      return ['螺栓监测', '次要报警监测点', '重要报警监测点', '紧急报警监测点'];
    default:
      break;
  }
}

function calculateAlarmState(alarmNum: AssetStatistics['alarmNum']): Record<AlarmState, number> {
  return {
    normal: alarmNum.reduce((prev, crt) => prev + crt),
    info: alarmNum[0],
    warn: alarmNum[1],
    danger: alarmNum[2]
  };
}

export function getAlarmStateOfAsset(alarmNum: AssetStatistics['alarmNum']) {
  let state: AlarmState = 'normal';
  if (alarmNum[0]) state = 'info';
  if (alarmNum[1]) state = 'warn';
  if (alarmNum[2]) state = 'danger';
  return state;
}

const x: AssetStatisticsPro = {
  deviceNum: 1,
  monitoringPointNum: 1,
  offlineDeviceNum: 1,
  state: 'normal',
  normal: 20,
  danger: 0,
  warn: 0,
  info: 0,
  anomalous: 0
};
