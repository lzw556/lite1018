import * as React from 'react';
import { MeasurementRow } from '../measurement/props';
import { AlarmState, AlarmStatistics, NameValue } from '../props';

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
  statistics: AssetChildrenStatistics;
};

export type AssetChildrenStatistics = {
  alarmNum: [number, number, number];
  assetId: number;
  deviceNum: number;
  monitoringPointNum: number;
  offlineDeviceNum: number;
};

export type VM_AssetStatistics = Record<keyof AssetChildrenStatistics, NameValue> & {
  alarmState: AlarmState;
} & AlarmStatistics;

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

type Visible =
  | Exclude<keyof VM_AssetStatistics, 'alarmState'>
  | [Exclude<keyof VM_AssetStatistics, 'alarmState'>, string];
export function transformAssetStatistics(statis: AssetChildrenStatistics, ...visibles: Visible[]) {
  const { alarmNum } = statis;
  const alarmState = getAlarmStateOfAsset(alarmNum);
  const childrenStatis = mapAssetStatistics(statis);
  const alarmStatis = calculateAlarmStatis(alarmNum);
  const alarmStatisWithName = mapAlarmStatistics(alarmStatis);
  return tranformVM_AssetStatistics(
    { ...childrenStatis, alarmState, ...alarmStatisWithName },
    ...visibles
  );
}

function tranformVM_AssetStatistics(statis: VM_AssetStatistics, ...visibles: Visible[]) {
  const groups: NameValue[] = [];
  visibles.forEach((key) => {
    if (typeof key === 'object') {
      const _key = key[0];
      const name = key[1];
      groups.push({ name, value: statis[_key].value });
    } else {
      groups.push(statis[key]);
    }
  });
  return { statistics: groups, alarmState: statis.alarmState };
}

function getAlarmStateOfAsset(alarmNum: AssetChildrenStatistics['alarmNum']) {
  let state: AlarmState = 'normal';
  if (!alarmNum || alarmNum.length < 3) return state;
  if (alarmNum[0]) state = 'info';
  if (alarmNum[1]) state = 'warn';
  if (alarmNum[2]) state = 'danger';
  return state;
}

function calculateAlarmStatis(
  alarmNum: AssetChildrenStatistics['alarmNum']
): Record<AlarmState, number> {
  if (!alarmNum || alarmNum.length < 3)
    return {
      normal: 0,
      info: 0,
      warn: 0,
      danger: 0,
      anomalous: 0
    };
  return {
    normal: alarmNum.reduce((prev, crt) => prev + crt),
    info: alarmNum[0],
    warn: alarmNum[1],
    danger: alarmNum[2],
    anomalous: alarmNum[0] + alarmNum[1] + alarmNum[2]
  };
}

function mapAssetStatistics(statis: AssetChildrenStatistics) {
  let res: Record<keyof AssetChildrenStatistics, NameValue> = {} as Record<
    keyof AssetChildrenStatistics,
    NameValue
  >;
  let key: keyof AssetChildrenStatistics;
  for (key in statis) {
    if (key === 'alarmNum') continue;
    res[key] = { name: mapAssetStatisticsProperty(key), value: statis[key] };
  }
  return res;
}
function mapAssetStatisticsProperty(propertyName: keyof AssetChildrenStatistics) {
  switch (propertyName) {
    case 'deviceNum':
      return '传感器';
    case 'monitoringPointNum':
      return '监测点';
    case 'offlineDeviceNum':
      return '离线传感器';
    default:
      return propertyName;
  }
}
function mapAlarmStatistics(statis: Record<AlarmState, number>) {
  let res: Record<keyof AlarmStatistics, NameValue> = {} as Record<
    keyof AlarmStatistics,
    NameValue
  >;
  let key: keyof AlarmStatistics;
  for (key in statis) {
    res[key] = { name: getAlarmStateText(key), value: statis[key] };
  }
  return res;
}
function getAlarmStateText(state: AlarmState) {
  switch (state) {
    case 'normal':
      return '正常';
    case 'info':
      return '次要';
    case 'warn':
      return '重要';
    case 'danger':
      return '紧急';
    case 'anomalous':
      return '异常';
    default:
      return 'unkown';
  }
}
