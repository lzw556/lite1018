import { round } from 'lodash';
import moment from 'moment';
import { LineChartStyles } from '../../../constants/chart';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../../constants/color';
import { isMobile } from '../../../utils/deviceDetection';
import { AssetRow } from '../assetList/props';
import { sortMeasurementsByAttributes } from '../measurementList/util';
import { MeasurementRow, Property } from '../summary/measurement/props';
import { MeasurementTypes } from './constants';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from './statisticsHelper';

export type HistoryData = {
  timestamp: number;
  values: Property[];
}[];
export function generateChartOptionsOfLastestData(
  measurements: MeasurementRow[],
  attributes?: AssetRow['attributes'],
  isBig: boolean = false
) {
  const count = measurements.length;
  if (!count) return null;
  let radar: any = [];
  const polar: { radius: number }[] = [];
  const angleAxis: any = [];
  const radiusAxis: any = [];
  const series: any = [];
  const sortedMeasurements = sortMeasurementsByAttributes(measurements);
  const outer = generateOuter(sortedMeasurements, isBig);
  polar.push(outer.radius);
  angleAxis.push(outer.angleAxis);
  radiusAxis.push(outer.radiusAxis);
  series.push(outer.series);

  const actuals = generateActuals(sortedMeasurements, isBig);
  polar.push(actuals.radius);
  angleAxis.push(actuals.angleAxis);
  const max = getMax(actuals.max, attributes, measurements[0].type);
  const min = measurements[0].type === MeasurementTypes.loosening_angle.id ? -(max * 1.5) : max / 2;
  radiusAxis.push({ ...actuals.radiusAxis, max, min });
  series.push(actuals.series);

  const legends = [];
  const firstClassFields = getFirstClassFields(measurements[0]);
  let field: any = null;
  if (firstClassFields.length > 0) {
    field = firstClassFields[0];
  }
  if (
    measurements[0].type === MeasurementTypes.preload.id &&
    checkValidAttr(attributes, 'normal', min)
  ) {
    const seriesName = `额定值 ${attributes?.normal?.value}${field?.unit}`
    const normal = getSeries(ColorHealth, attributes?.normal?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorHealth } });
    series.push(normal.series);
  }

  if (
    measurements[0].type === MeasurementTypes.loosening_angle.id &&
    checkValidAttr(attributes, 'initial', min)
  ) {
    const seriesName = `初始值 ${attributes?.initial?.value}${field?.unit}`
    const initial = getSeries(ColorHealth, attributes?.initial?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorHealth } });
    series.push(initial.series);
  }

  if (checkValidAttr(attributes, 'info', min)) {
    const seriesName = `次要报警 ${attributes?.info?.value}${field?.unit}`
    const info = getSeries(ColorInfo, attributes?.info?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorInfo } });
    series.push(info.series);
  }

  if (checkValidAttr(attributes, 'warn', min)) {
    const seriesName = `重要报警 ${attributes?.warn?.value}${field?.unit}`
    const warn = getSeries(ColorWarn, attributes?.warn?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorWarn } });
    series.push(warn.series);
  }

  if (checkValidAttr(attributes, 'danger', min)) {
    const seriesName = `严重报警 ${attributes?.danger?.value}${field?.unit}`
    const danger = getSeries(ColorDanger, attributes?.danger?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorDanger } });
    series.push(danger.series);
  }

  return {
    radar,
    polar,
    angleAxis,
    radiusAxis,
    legend: {
      data: legends,
      bottom: isMobile ? 50 : 0
    },
    series
  };
}

function checkValidAttr(
  attributes: AssetRow['attributes'],
  key: keyof Pick<
    Required<Required<AssetRow>['attributes']>,
    'normal' | 'initial' | 'info' | 'warn' | 'danger'
  >,
  reference: number,
  abs?: boolean
) {
  if (attributes) {
    const item = attributes[key];
    if (item) {
      if (abs) {
        return item.enabled && item.value !== '' && Math.abs(item.value as number) > reference;
      }
      return item.enabled && item.value !== '' && item.value > reference;
    }
    return false;
  }
  return false;
}

function getMax(max: number, attributes: AssetRow['attributes'], type: number) {
  let final = max;
  if (type === MeasurementTypes.preload.id && checkValidAttr(attributes, 'normal', final, true)) {
    final = Math.abs(attributes?.normal?.value as number);
  }
  if (
    type === MeasurementTypes.loosening_angle.id &&
    checkValidAttr(attributes, 'initial', final, true)
  ) {
    final = Math.abs(attributes?.initial?.value as number);
  }
  if (checkValidAttr(attributes, 'info', final, true)) {
    final = Math.abs(attributes?.info?.value as number);
  }
  if (checkValidAttr(attributes, 'warn', final, true)) {
    final = Math.abs(attributes?.warn?.value as number);
  }
  if (checkValidAttr(attributes, 'danger', final, true)) {
    final = Math.abs(attributes?.danger?.value as number);
  }
  return final;
}

function generateRowOfTooltip(marker: string, seriesName: string, text: string) {
  return `<div style='display:flex;justify-content:space-between;'><span style='flex:0 0 auto'>${marker} ${seriesName}</span><strong style='flex:0 0 auto; text-align:right;text-indent:1em;'>${text}</strong></div>`;
}

export function generateChartOptionsOfHistoryData(
  history: { name: string; data: HistoryData }[],
  measurementType: typeof MeasurementTypes.loosening_angle
) {
  let crtProperty: any = null;
  const series = history.map(({ name, data }) => {
    const { property, seriesData } = pickHistoryData(data, measurementType.firstClassFieldKeys[0]);
    crtProperty = property;
    return {
      type: 'line',
      name,
      data: seriesData
    };
  });

  return {
    title: {
      text: '',
      left: isMobile ? 0 : 80,
      subtext: crtProperty ? `${crtProperty.name}(${crtProperty.unit})` : ''
    },
    legend: { bottom: 0 },
    grid: { bottom: isMobile ? 120 : 60 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: any) =>
        `${getDisplayValue(value, crtProperty?.unit)}`
    },
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    series
  };
}

function generateOuter(measurements: MeasurementRow[], isBig: boolean = false) {
  let radius: any = { radius: isBig ? 180 : 150 };
  if(isMobile){
    radius = { radius: isBig ? '90%' : '85%' };
  }
  const angleAxis = {
    type: 'category',
    startAngle: 0,
    clockwise: false,
    boundaryGap: false,
    axisLine: { show: true, lineStyle: { type: 'dashed' } },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    data: Object.keys(measurements)
  };
  const radiusAxis = {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false }
  };
  const seriesData = measurements.map(({ name, attributes, data, alertLevel }, index) => {
    const firstClassFields = getFirstClassFields(measurements[0]);
    let field: any = null;
    if (firstClassFields.length > 0) {
      field = firstClassFields[0];
    }
    let value = NaN;
    if (field && data) {
      value = roundValue(data.values[field.key], field.precision);
    }
    return {
      name,
      value: [1, index, `${name}`],
      label: {
        show: true,
        color: '#fff',
        formatter: (paras: any) => attributes?.index
      },
      tooltip: {
        formatter: `${
          alertLevel && alertLevel > 0
            ? `${getAlarmStateText(convertAlarmLevelToState(alertLevel))}报警<br/>`
            : ''
        }${generateRowOfTooltip('', name, getDisplayValue(value, field?.unit))}`
      },
      itemStyle: {
        opacity: 1,
        color: getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))
      }
    };
  });
  const series = {
    type: 'scatter',
    name: 'outer',
    coordinateSystem: 'polar',
    polarIndex: 0,
    symbol:
      'path://M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z',
    symbolSize: 30,
    data: seriesData,
    zlevel: 10
  };
  return { radius, angleAxis, radiusAxis, series };
}

function generateActuals(measurements: MeasurementRow[], isBig: boolean = false) {
  let radius: any = { radius: isBig ? 150 : 120 };
  if(isMobile){
    radius = { radius: isBig ? '85%' : '80%' };
  }
  const seriesData: any = [];
  const firstClassFields = getFirstClassFields(measurements[0]);
  let field: any = null;
  if (firstClassFields.length > 0) {
    field = firstClassFields[0];
  }
  let max = 0;
  let min = 0;
  measurements.forEach(({ data, name }, index) => {
    let value = NaN;
    if (field && data) {
      value = roundValue(data.values[field.key], field.precision);
      if (value) {
        if (Math.abs(value) > max) max = Math.abs(value);
        if (value < min) min = value;
      }
    }
    if(!Number.isNaN(value)) seriesData.push([value, (index * 360) / measurements.length]);
  });
  const angleAxis = {
    polarIndex: 1,
    type: 'value',
    startAngle: 0,
    clockwise: false,
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    min: 0,
    max: 360
  };
  const radiusAxis = {
    polarIndex: 1,
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    max,
    min: max / 2
  };
  const series = {
    type: 'line',
    name: '实际值',
    data: [...seriesData, seriesData[0]],
    itemStyle: { color: 'rgb(0,130,252)' },
    tooltip: { show: false },
    zlevel: 15,
    coordinateSystem: 'polar',
    polarIndex: 1,
    smooth: false
  };
  return { series, max, radius, angleAxis, radiusAxis, min };
}

function getSeries(color: string, value: number | string | undefined, name: string) {
  const data = [];
  for (let index = 0; index < 360; index++) {
    data.push([value, index]);
  }
  const series = {
    type: 'line',
    coordinateSystem: 'polar',
    polarIndex: 1,
    data,
    symbol: 'none',
    symbolSize: 0.01,
    name,
    lineStyle: { type: 'dashed', color, opacity: 0.6 }
    // label: {show: true, formatter:(para:any)=>{
    //   if(para.dataIndex === 0) return para.value[0];
    //   return ''
    // }}
  };
  return { series };
}

export function getHistoryDatas(data: HistoryData, propertyName?: string) {
  const firstValue = data[0].values;
  const times = data.map(({ timestamp }) => timestamp);
  return firstValue
    .filter((property) => (propertyName ? property.key === propertyName : true))
    .map((property) => {
      const seriesData = property.fields.map((field) => {
        const fieldData = data.map(({ values }) => {
          let value = NaN;
          const crtProperty = values.find(({ key }) => key === property.key);
          if (crtProperty) {
            const crtField = crtProperty.fields.find(({ key }) => key === field.key);
            if (crtField) value = roundValue(crtProperty.data[field.name], property.precision);
          }
          return value;
        });
        return { name: field.name, data: fieldData };
      });
      return { times, seriesData, property };
    });
}

function pickHistoryData(data: HistoryData, propertyName: string) {
  let crtProperty: any = null;
  const seriesData = data.map(({ timestamp, values }) => {
    let value = NaN;
    for (const property of values) {
      const field = property.fields.find(({ key }) => key === propertyName);
      if (field) {
        crtProperty = property;
        value = roundValue(property.data[field.name], property.precision);
        break;
      }
    }
    return [moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss'), value];
  });
  return { property: crtProperty, seriesData };
}

export function generateChartOptionsOfHistoryDatas(data: HistoryData, propertyName?: string) {
  const optionsData = getHistoryDatas(data, propertyName);
  return optionsData.map(({ times, seriesData, property }) => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          let relVal = params[0].name;
          for (let i = 0; i < params.length; i++) {
            let value = Number(params[i].value);
            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${getDisplayValue(
              value,
              property.unit
            )}`;
          }
          return relVal;
        }
      },
      legend: { show: !!propertyName },
      grid: { bottom: 20, left: 50 },
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
        axisLabel: { align: 'left' },
        data: times.map((item) => moment.unix(item).local().format('YYYY-MM-DD HH:mm:ss'))
      },
      yAxis: { type: 'value' }
    };
  });
}

export function generatePropertyColumns(measurement: MeasurementRow) {
  const properties = getFirstClassFields(measurement);
  if (properties.length > 0) {
    return properties
      .map(({ name, key, unit, precision }) => ({
        title: `${name}${unit ? `(${unit})` : ''}`,
        key,
        render: ({ data }: MeasurementRow) => {
          let value = NaN;
          if (data && data.values) {
            value = roundValue(data.values[key], precision);
          }
          return getDisplayValue(value, unit);
        },
        width: 120
      }))
      .concat({
        title: '采集时间',
        key: 'timestamp',
        render: (measurement: MeasurementRow) => {
          return measurement.data && measurement.data.timestamp
            ? moment(measurement.data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
            : '-';
        },
        width: 200
      });
  }
  return [];
}

function getDisplayValue(value: number | null | undefined, unit?: string) {
  if (Number.isNaN(value) || value === null || value === undefined) return '-';
  return `${value}${unit ?? ''}`;
}

function roundValue(value: number, precision?: number) {
  if(Number.isNaN(value) || value === 0) return value;
  return round(value, precision ?? 3);
}

function getKeysOfFirstClassFields(measurementType: number) {
  const type = Object.values(MeasurementTypes).find((type) => type.id === measurementType);
  return type ? type.firstClassFieldKeys : [];
}

function getFirstClassFields(measurement: MeasurementRow) {
  const fields: (Property['fields'][0] & Pick<Property, 'precision' | 'unit'>)[] = [];
  getKeysOfFirstClassFields(measurement.type).forEach((fieldKey) => {
    for (const property of measurement.properties) {
      const field = property.fields.find((field) => field.key === fieldKey);
      if (field) {
        fields.push({ ...field, unit: property.unit, precision: property.precision });
        break;
      }
    }
  });
  return fields;
}

export function generateDatasOfMeasurement(measurement: MeasurementRow) {
  const properties = getFirstClassFields(measurement);
  const { data } = measurement;
  if (properties.length > 0) {
    return properties
      .map(({ name, key, unit, precision }) => {
        let value = NaN;
        if (data && data.values) {
          value = roundValue(data.values[key], precision);
        }
        return { name, value: getDisplayValue(value, unit) };
      })
      // .concat({
      //   name: '采集时间',
      //   value: data ? moment(data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'
      // });
  }
  return [];
}
