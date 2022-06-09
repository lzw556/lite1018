import * as React from 'react';
import { LineChartStyles } from '../../../constants/chart';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../../constants/color';
import { MeasurementRow } from '../measurement/props';
import { AlarmState, NameValue } from '../props';

export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
  attributes?: { index: number; type: number };
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
  attributes?: { index: number; type: number };
};

export type AssetChildrenStatistics = {
  alarmNum: [number, number, number];
  assetId: number;
  deviceNum: number;
  monitoringPointNum: number;
  offlineDeviceNum: number;
};

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return {
    id: values.id,
    name: values.name,
    parent_id: values.parentId,
    type: values.type,
    attributes: values.attributes
  };
}

export function generatePreloadOptions(
  {
    times,
    seriesData,
    property
  }: {
    times: any;
    seriesData: any;
    property: any;
  },
  measurementName: string
) {
  return {
    title: {
      text: '',
      left: 'center'
    },
    legend: { bottom: 0 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: times.map((item: any) => item.format('YYYY-MM-DD HH:mm:ss'))
    },
    // yAxis: { type: 'value', min: 290, max: 360 },
    yAxis: { type: 'value' },
    series: seriesData.map(({ name, data }: any, index: any) => ({
      type: 'line',
      name: measurementName,
      areaStyle: LineChartStyles[index].areaStyle,
      data
    }))
  };
}

export function transformAssetStatistics(statis: AssetChildrenStatistics, ...visibles: Visible[]) {
  const { alarmNum, monitoringPointNum } = statis;
  const alarmState = getAlarmStateOfAsset(alarmNum);
  const childrenStatis = mapAssetStatistics(statis);
  const alarmStatis = calculateAlarmStatis(monitoringPointNum, alarmNum);
  const alarmStatisWithName = mapAlarmStatistics(alarmStatis);
  return tranformVM_AssetStatistics(childrenStatis, alarmState, alarmStatisWithName, ...visibles);
}

type Visible =
  | (keyof AssetChildrenStatistics | AlarmState)
  | [keyof AssetChildrenStatistics | AlarmState, string];
function tranformVM_AssetStatistics(
  childrenStatis: Map<keyof AssetChildrenStatistics, NameValue>,
  alarmState: AlarmState,
  alarmStatisWithName: Map<AlarmState, NameValue>,
  ...visibles: Visible[]
) {
  const groups: NameValue[] = [];
  visibles.forEach((visible) => {
    let name = '';
    let value: string | number = '';
    let key = visible;
    if (typeof visible === 'object') {
      key = visible[0];
      name = visible[1];
    }
    const assetStatis = childrenStatis.get(key as keyof AssetChildrenStatistics);
    const alarmStatis = alarmStatisWithName.get(key as AlarmState);
    if (assetStatis) {
      value = assetStatis.value;
      if (!name) name = assetStatis.name;
    } else if (alarmStatis) {
      value = alarmStatis.value;
      if (!name) name = alarmStatis.name;
    }
    groups.push({ name, value });
  });
  return { statistics: groups, alarmState };
}

function getAlarmStateOfAsset(alarmNum: AssetChildrenStatistics['alarmNum']) {
  let state: AlarmState = 'normal';
  if (!alarmNum || alarmNum.length < 3) return state;
  if (alarmNum[0]) state = 'info';
  if (alarmNum[1]) state = 'warn';
  if (alarmNum[2]) state = 'danger';
  return state;
}

export function calculateAlarmStatis(
  total: number,
  alarmNum: AssetChildrenStatistics['alarmNum'],
  ...excludedStates: AlarmState[]
): Map<AlarmState, number> {
  const statis = new Map<AlarmState, number>();
  statis.set('normal', total);
  statis.set('info', 0);
  statis.set('warn', 0);
  statis.set('danger', 0);
  statis.set('anomalous', 0);
  if (alarmNum.length === 3) {
    statis.set('info', alarmNum[0]);
    statis.set('warn', alarmNum[1]);
    statis.set('danger', alarmNum[2]);
    statis.set('anomalous', alarmNum[0] + alarmNum[1] + alarmNum[2]);
  }
  if (excludedStates && excludedStates.length > 0) {
    return new Map(
      Array.from(statis).filter(
        ([alarmState]) => !excludedStates.find((state) => state === alarmState)
      )
    );
  }
  return statis;
}

function mapAssetStatistics(statis: AssetChildrenStatistics) {
  const final = new Map<keyof AssetChildrenStatistics, NameValue>();
  let key: keyof AssetChildrenStatistics;
  for (key in statis) {
    if (key === 'alarmNum') continue;
    final.set(key, { name: mapAssetStatisticsProperty(key), value: statis[key] });
  }
  return final;
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

export function mapAlarmStatistics(statis: Map<AlarmState, number>) {
  const res = new Map<AlarmState, NameValue>();
  for (const [key, value] of statis) {
    res.set(key, { name: getAlarmStateText(key), value });
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

export function getAlarmLevelColor(state: AlarmState) {
  switch (state) {
    case 'normal':
      return ColorHealth;
    case 'info':
      return ColorInfo;
    case 'warn':
      return ColorWarn;
    case 'danger':
      return ColorDanger;
    default:
      return ColorHealth;
  }
}

export function generateProjectAlarmStatis(total: number, alarmNum: [number, number, number]) {
  return Array.from(mapAlarmStatistics(calculateAlarmStatis(total, alarmNum, 'anomalous'))).map(
    ([alarmState, nameValue]) => {
      return {
        name: nameValue.name,
        value: nameValue.value,
        itemStyle: { color: getAlarmLevelColor(alarmState) }
      };
    }
  );
}
