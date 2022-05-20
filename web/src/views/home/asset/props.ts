import * as React from 'react';
import { MeasurementRow } from '../measurement/props';

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
  ProjectID: number;
};

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return { id: values.id, name: values.name, parent_id: values.parentId, type: values.type };
}

function generateFakeActual(measurements: MeasurementRow[]) {
  const actual = [];
  const count = measurements.length;
  for (let index = count; index > 0; index--) {
    actual.push(300 + Math.random() * 20);
  }
  return actual;
}

function generateFakeMaxinum(measurements: MeasurementRow[], max: number) {
  const maxinum = [];
  const count = measurements.length;
  for (let index = count; index > 0; index--) {
    maxinum.push({ name: index, max });
  }
  return maxinum;
}

function generateFakeCircle(measurements: MeasurementRow[]) {
  const bolts = [];
  const count = measurements.length;
  const interval = 360 / count;
  for (let index = count; index > 0; index--) {
    bolts.push([800, interval * index]);
  }
  return bolts.map((item, index) => ({
    name: `item${index}`,
    value: item,
    label: {
      show: true,
      color: '#fff',
      formatter: (paras: any) => {
        return paras.data.value[1] / interval;
      }
    }
  }));
}

export function useChartOptions(
  measurements: MeasurementRow[],
  actual?: number[],
  maxinum?: number[]
) {
  const count = measurements.length;
  const startAngle = 360 / count + 90;
  const indicator = generateFakeMaxinum(measurements, 600);
  const _actual = generateFakeActual(measurements);
  const _maxinum = generateFakeCircle(measurements);

  const origin = {
    polar: [
      { id: 'inner', radius: '55%' },
      { id: 'outer', radius: '70%' }
    ],
    angleAxis: [
      {
        type: 'value',
        polarIndex: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      },
      {
        type: 'value',
        polarIndex: 1,
        startAngle,
        axisLine: { show: true, lineStyle: { type: 'dashed' } },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      }
    ],
    radiusAxis: [
      {
        polarIndex: 0,
        max: 700,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#ccc' }
      },
      {
        polarIndex: 1,
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
        min: 1,
        max: 801
      }
    ],
    radar: {
      radius: '50%',
      indicator,
      axisName: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
      splitArea: { show: false }
    },
    legend: {
      data: [
        {
          name: '实际值'
        },
        {
          name: '规定值'
        }
      ],
      bottom: 0
    },
    series: [
      {
        type: 'radar',
        name: '实际值',
        lineStyle: { color: 'rgb(255, 68, 0, .6)' },
        itemStyle: { color: 'rgb(255, 68, 0, .6)' },
        data: [{ value: _actual }]
      },
      {
        type: 'line',
        name: '规定值',
        coordinateSystem: 'polar',
        data: valuesRule,
        symbol: 'none',
        itemStyle: { color: '#00800080' },
        lineStyle: { type: 'dashed', color: '#00800080' }
      },
      {
        type: 'scatter',
        name: 'bg',
        coordinateSystem: 'polar',
        polarIndex: 1,
        symbol:
          'path://M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z',
        symbolSize: 30,
        data: valuesSensor,
        itemStyle: {
          opacity: 1,
          color: '#555'
        },
        zlevel: 10
      }
    ]
  };
  const [options] = React.useState();
  return options;
}
