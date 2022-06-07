import moment from 'moment';
import { LineChartStyles } from '../../constants/chart';
import { MeasurementHistoryData, MeasurementRow } from './measurement/props';
import { cloneDeep, round } from 'lodash';
import { AssetRow } from './asset/props';
import { Node } from './props';
import { AssetTypes, MeasurementTypes } from './constants';

export function generateColProps({ xs, sm, md, lg, xl, xxl }: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number }) {
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

export function generateFlangeChartOptions(measurements: MeasurementRow[], size: { inner: string; outer: string }) {
  const count = measurements.length;
  if (!count) return null;
  const startAngle = 360 / count + 90;
  const actuals = generateActuals(measurements);
  let minActual = actuals[0][0];
  let maxActual = minActual;
  actuals.forEach(([value, angle]) => {
    if (value > maxActual) maxActual = value;
    if (value < minActual) minActual = value;
  });
  const factor = maxActual - minActual > 0 ? (maxActual - minActual) / 2 : Math.abs(maxActual) / 2;
  minActual = minActual - factor;
  maxActual = maxActual + factor;
  const circleMax = maxActual + 1;
  const _maxinum = generateFakeCircle(measurements, circleMax);
  const specification = generateFakeSpecification((minActual + maxActual) / 2);
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
        max: maxActual,
        min: minActual,
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
        min: minActual,
        max: circleMax
      }
    ],
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
        type: 'line',
        name: '实际值',
        coordinateSystem: 'polar',
        lineStyle: { color: '#00800080' },
        itemStyle: { color: '#00800080' },
        data: actuals
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

function generateActuals(measurements: MeasurementRow[]) {
  const actuals = [];
  const interval = 360 / measurements.length;
  let first = 0;
  for (let index = 0; index < measurements.length; index++) {
    const point = measurements[index];
    let propName = '';
    const firstClassProperties = getFirstClassProperties(point.type);
    if (firstClassProperties.length > 0) propName = firstClassProperties[0];
    const data = transformSingleMeasurmentData(point, propName);
    actuals.push([data.length > 0 ? data[0].value : NaN, index * interval]);
    if (index === 0) first = data.length > 0 ? data[0].value : NaN;
  }
  return actuals.concat([[first, 360]]);
}

function generateFakeSpecification(max: number) {
  const maxinum = [];
  for (let index = 360; index > 0; index = index - 3) {
    maxinum.push([max, index]);
  }
  return maxinum;
}

function generateFakeCircle(measurements: MeasurementRow[], max: number) {
  const interval = 360 / measurements.length;
  return measurements
    .sort((prev, next) => {
      const prevIndex = prev.attributes?.index || 5;
      const nextIndex = next.attributes?.index || 5;
      return prevIndex - nextIndex;
    })
    .map(({ name, attributes }, index) => ({
      name,
      value: [max, interval * index],
      label: {
        show: true,
        color: '#fff',
        formatter: (paras: any) => attributes?.index
      }
    }));
}

export function transformMeasurementHistoryData(data: MeasurementHistoryData, propertyName?: string) {
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

export function generateMeasurementHistoryDataOptions(data: MeasurementHistoryData, propertyName?: string) {
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
        subtext: propertyName ? '' : `${seriesData.map(({ name, data }) => name + ' ' + data[data.length - 1])}`
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
    return {
      ...fn(node),
      children: node.children.map((node) => mapTreeNode(node, fn))
    };
  } else {
    return fn(node);
  }
}

export function forEachTreeNode<N extends Node>(node: N, fn: <N extends Node>(node: N) => void): void {
  fn(node);
  if (node.children && node.children.length > 0) {
    node.children.map((node) => forEachTreeNode(node, fn));
  }
}

export function transformSingleMeasurmentData(measurement: MeasurementRow, ...filters: string[]) {
  const { properties, data } = measurement;
  if (!data) return [];
  const { values } = data;
  const res = [];
  for (const property of properties) {
    const { fields } = property;
    for (const keyOfValues in values) {
      const field = fields.find(({ key }) => {
        if (filters.length > 0) {
          return key === keyOfValues && filters.find((propname) => propname === key);
        } else {
          return key === keyOfValues;
        }
      });
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
  return res;
}

export function generatePropertyColumns(measurement: MeasurementRow) {
  const properties = pickFirstClassProperties(measurement);
  if (properties.length > 0) {
    return properties
      .map(({ name, key, unit }) => ({
        title: `${name}${unit ? `(${unit})` : ''}`,
        key,
        render: (measurement: MeasurementRow) => {
          const data = transformSingleMeasurmentData(measurement, key);
          return data.length > 0 ? data[0].value.toString() : '-';
        },
        width: 120
      }))
      .concat({
        title: '采集时间',
        key: 'timestamp',
        render: (measurement: MeasurementRow) => {
          return measurement.data && measurement.data.timestamp ? moment(measurement.data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-';
        },
        width: 150
      });
  }
  return [];
}

function getFirstClassProperties(measurementType: number) {
  const type = Object.values(MeasurementTypes).find((type) => type.id === measurementType);
  return type ? type.firstClassProperties : [];
}

export function pickFirstClassProperties(measurement: MeasurementRow) {
  const firstClassProperties = getFirstClassProperties(measurement.type);
  return measurement.properties.filter(({ fields }) => {
    return fields.find((field) => firstClassProperties.find((property) => property === field.key));
  });
}

export function getAssetType(typeId: number) {
  return Object.values(AssetTypes).find((type) => type.id === typeId);
}
