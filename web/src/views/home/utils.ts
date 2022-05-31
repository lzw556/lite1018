import moment from 'moment';
import { LineChartStyles } from '../../constants/chart';
import { MeasurementHistoryData, MeasurementRow } from './measurement/props';
import { cloneDeep, round } from 'lodash';
import { AssetRow } from './asset/props';
import { Node } from './props';

export function generateColProps({
  xs,
  sm,
  md,
  lg,
  xl,
  xxl
}: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}) {
  const colCount = 24;
  return {
    xs: { span: xs ?? colCount },
    sm: { span: sm ?? colCount },
    md: { span: md ?? colCount },
    lg: { span: lg ?? colCount },
    xl: { span: xl ?? colCount },
    xxl: { span: xxl ?? colCount }
  };
}

export function generateFlangeChartOptions(
  measurements: MeasurementRow[],
  size: { inner: string; outer: string },
  actual?: number[],
  maxinum?: number[]
) {
  const count = measurements.length;
  if (!count) return null;
  const startAngle = 360 / count + 90;
  const indicator = generateFakeMaxinum(measurements, 600);
  const _actual = generateFakeActual(measurements);
  const specification = generateFakeSpecification(300);
  const _maxinum = generateFakeCircle(measurements);

  return {
    polar: [
      { id: 'inner', radius: size.inner },
      { id: 'outer', radius: size.outer }
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
          name: '实际值',
          icon: 'circle'
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
        lineStyle: { color: '#00800080' },
        itemStyle: { color: '#00800080' },
        data: [{ value: _actual }]
      },
      {
        type: 'line',
        name: '规定值',
        coordinateSystem: 'polar',
        data: specification,
        symbol: 'none',
        itemStyle: { color: 'rgb(255, 68, 0, .6)' },
        lineStyle: { type: 'dashed', color: 'rgb(255, 68, 0, .6)' }
      },
      {
        type: 'scatter',
        name: 'bg',
        coordinateSystem: 'polar',
        polarIndex: 1,
        symbol:
          'path://M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z',
        symbolSize: 30,
        data: _maxinum,
        itemStyle: {
          opacity: 1,
          color: '#555'
        },
        zlevel: 10
      }
    ]
  };
}

function generateFakeActual(measurements: MeasurementRow[]) {
  const actual = [];
  const count = measurements.length;
  for (let index = count; index > 0; index--) {
    actual.push(300 + Math.random() * 200);
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

function generateFakeSpecification(max: number) {
  const maxinum = [];
  for (let index = 360; index > 0; index = index - 3) {
    maxinum.push([max, index]);
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

export function transformMeasurementHistoryData(
  data: MeasurementHistoryData,
  propertyName?: string
) {
  const firstValue = data[0].values;
  const times = data.map(({ timestamp }) => moment.unix(timestamp).local());
  return firstValue
    .filter((property) => (propertyName ? property.key === propertyName : true))
    .map((property) => {
      const seriesData = property.fields.map((field) => {
        const fieldData = data.map(({ values }) => {
          let value = NaN;
          const crtProperty = values.find(({ key }) => key === property.key);
          if (crtProperty) {
            const crtField = crtProperty.fields.find(({ key }) => key === field.key);
            if (crtField) value = crtProperty.data[field.name];
          }
          if (value) {
            const precision = property.precision ?? 3;
            value = round(value, precision);
          }
          return value;
        });
        return { name: field.name, data: fieldData };
      });
      return { times, seriesData, property };
    });
}

export function generateMeasurementHistoryDataOptions(
  data: MeasurementHistoryData,
  propertyName?: string
) {
  const optionsData = transformMeasurementHistoryData(data, propertyName);
  return optionsData.map(({ times, seriesData, property }) => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          let relVal = params[0].name;
          for (let i = 0; i < params.length; i++) {
            let value = Number(params[i].value);
            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`;
          }
          return relVal;
        }
      },
      legend: { show: !!propertyName },
      grid: { bottom: 20 },
      title: {
        text: `${property.name}${property.unit ? `(${property.unit})` : ''}`,
        subtext: propertyName
          ? ''
          : `${seriesData.map(({ name, data }) => name + ' ' + data[data.length - 1])}`
      },
      series: seriesData.map(({ name, data }, index) => ({
        type: 'line',
        name,
        areaStyle: LineChartStyles[index].areaStyle,
        data
      })),
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times.map((item: any) => item.format('YYYY-MM-DD HH:mm:ss'))
      },
      yAxis: { type: 'value' }
    };
  });
}
// use in treeTable
export function filterEmptyChildren(assets: AssetRow[]) {
  if (assets.length === 0) return [];
  const copy = cloneDeep(assets);
  return copy.map((asset) =>
    mapTreeNode(asset, (asset) => {
      if (asset.children && asset.children.length === 0) {
        delete asset.children;
        return asset;
      } else {
        return asset;
      }
    })
  );
}

export function mapTreeNode<N extends Node>(node: N, fn: <N extends Node>(node: N) => N): N {
  if (node.children && node.children.length > 0) {
    return { ...fn(node), children: node.children.map((node) => mapTreeNode(node, fn)) };
  } else {
    return fn(node);
  }
}

export function forEachTreeNode<N extends Node>(
  node: N,
  fn: <N extends Node>(node: N) => void
): void {
  fn(node);
  if (node.children && node.children.length > 0) {
    node.children.map((node) => forEachTreeNode(node, fn));
  }
}

export function transformSingleMeasurmentData(measurement: MeasurementRow) {
  const { properties, data } = measurement;
  if (!data) return [];
  const { values, timestamp } = data;
  const res = [];
  for (const property of properties) {
    const { fields } = property;
    for (const keyOfValues in values) {
      const field = fields.find(({ key }) => key === keyOfValues);
      if (field) {
        const precision = property.precision ?? 3;
        res.push({
          unit: property.unit,
          sort: property.sort,
          ...field,
          value: round(values[keyOfValues], precision)
        });
        break;
      }
    }
  }
  return generatePropertyColumns({ [timestamp]: res });
}

function generatePropertyColumns(data: {
  [x: number]: {
    value: number;
    key: string;
    name: string;
    dataIndex: number;
    unit: string;
    sort: number;
  }[];
}) {
  const timestamp = Number(Object.keys(data)[0]);
  const properties = data[timestamp];
  return properties
    .map(({ name, key, value, unit }) => ({
      title: `${name}${unit ? `(${unit})` : ''}`,
      key,
      render: () => value.toString(),
      width: 120
    }))
    .concat({
      title: '采集时间',
      key: 'timestamp',
      render: () => moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
      width: 150
    });
}
