import { cloneDeep, round } from 'lodash';
import moment from 'moment';
import { LineChartStyles } from '../../../constants/chart';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../../constants/color';
import { isMobile } from '../../../utils/deviceDetection';
import { AssetRow } from '../assetList/props';
import { sortMeasurementsByAttributes } from '../measurementList/util';
import { MeasurementRow, Property } from '../summary/measurement/props';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from './statisticsHelper';
import { FlangeStatusData } from '../summary/flange/FlangeStatus';
import { measurementTypes } from './constants';

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
  const min =
    measurements[0].type === measurementTypes.loosening_angle.id ? -(max * 1.5) : actuals.min || -1;
  radiusAxis.push({ ...actuals.radiusAxis, max, min });
  series.push(actuals.series);

  const legends = [];
  const firstClassFields = getFirstClassFields(measurements[0]);
  let field: any = null;
  if (firstClassFields.length > 0) {
    field = firstClassFields[0];
  }
  if (
    measurements[0].type === measurementTypes.preload.id &&
    checkValidAttr(attributes, 'normal', min)
  ) {
    const seriesName = `额定值 ${attributes?.normal?.value}${field?.unit}`;
    const normal = getSeries(ColorHealth, attributes?.normal?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorHealth } });
    series.push(normal.series);
  }

  if (
    measurements[0].type === measurementTypes.loosening_angle.id &&
    checkValidAttr(attributes, 'initial', min)
  ) {
    const seriesName = `初始值 ${attributes?.initial?.value}${field?.unit}`;
    const initial = getSeries(ColorHealth, attributes?.initial?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorHealth } });
    series.push(initial.series);
  }

  if (checkValidAttr(attributes, 'info', min)) {
    const seriesName = `次要报警 ${attributes?.info?.value}${field?.unit}`;
    const info = getSeries(ColorInfo, attributes?.info?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorInfo } });
    series.push(info.series);
  }

  if (checkValidAttr(attributes, 'warn', min)) {
    const seriesName = `重要报警 ${attributes?.warn?.value}${field?.unit}`;
    const warn = getSeries(ColorWarn, attributes?.warn?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorWarn } });
    series.push(warn.series);
  }

  if (checkValidAttr(attributes, 'danger', min)) {
    const seriesName = `紧急报警 ${attributes?.danger?.value}${field?.unit}`;
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
  if (type === measurementTypes.preload.id && checkValidAttr(attributes, 'normal', final, true)) {
    final = Math.abs(attributes?.normal?.value as number);
  }
  if (
    type === measurementTypes.loosening_angle.id &&
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
  property: Property,
  measurementType: number
) {
  const series = history.map(({ name, data }) => {
    const datas = getHistoryDatas(data, measurementType, property.key);
    let _data: [string, number][] = [];
    datas.forEach(({ times, seriesData, property: _property }) => {
      if (property.key === _property.key) {
        const _series = seriesData.find(({ name }) => name === property.name);
        if (_series) {
          times.map((time, index) =>
            _data.push([
              moment.unix(time).local().format('YYYY-MM-DD HH:mm:ss'),
              _series.data[index]
            ])
          );
        }
      }
    });
    return {
      type: 'line',
      name,
      data: _data,
      showSymbol: false
    };
  });

  return {
    title: {
      text: '',
      left: isMobile ? 0 : 80,
      subtext: property ? `${property.name}(${property.unit})` : ''
    },
    legend: { bottom: 0 },
    grid: { bottom: isMobile ? 120 : 60 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: any) => `${getDisplayValue(value, property?.unit)}`
    },
    xAxis: { type: 'time' },
    yAxis:
      measurementType === measurementTypes.preload.id
        ? { type: 'value' }
        : {
            type: 'value',
            ...calculateRangeOfAngle(series.map(({ data }) => data.map((item) => item[1])))
          },
    series
  };
}

function calculateRangeOfAngle(seriesData: number[][]) {
  let max = 15;
  let min = -5;
  seriesData.forEach((series) => {
    const maxSeries = Math.max(...series);
    const minSeries = Math.min(...series);
    if (maxSeries > max) max = maxSeries;
    if (minSeries < min) min = minSeries;
  });
  return { max, min };
}

function generateOuter(measurements: MeasurementRow[], isBig: boolean = false) {
  let radius: any = { radius: isBig ? 180 : 150 };
  if (isMobile) {
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
      value = roundValue(data.values[field.key] as number, field.precision);
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
  if (isMobile) {
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
      value = roundValue(data.values[field.key] as number, field.precision);
      if (value) {
        if (Math.abs(value) > max) max = Math.abs(value);
        if (value < min) min = value;
      }
    }
    if (!Number.isNaN(value)) seriesData.push([value, (index * 360) / measurements.length]);
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

function getHistoryDatas(data: HistoryData, measurementType: number, propertyKey?: string) {
  const firstValue = getSpecificProperties(data[0].values, measurementType);
  const times = data.map(({ timestamp }) => timestamp);
  return firstValue
    .filter((property) => (propertyKey ? property.key === propertyKey : true))
    .map((property) => {
      const seriesData = property.fields.map((field) => {
        const fieldValue = narrowSpecificProperty(data, property.key).map(({ value }) =>
          takeFieldValue(value, field.key)
        );
        return { name: field.name, data: fieldValue };
      });
      return { times, seriesData, property };
    });
}

function narrowSpecificProperty(data: HistoryData, propertyKey: string) {
  return data.map(({ timestamp, values }) => ({
    timestamp,
    value: values.find(({ key }) => key === propertyKey)
  }));
}

function takeFieldValue(property: Property | undefined, fieldKey: string) {
  if (property === undefined) return NaN;
  let value = NaN;
  const crtField = property.fields.find(({ key }) => key === fieldKey);
  if (crtField) value = roundValue(property.data[crtField.name], property.precision);
  return value;
}

export function generateChartOptionsOfHistoryDatas(
  data: HistoryData,
  measurementType: number,
  propertyKey?: string
) {
  const optionsData = getHistoryDatas(data, measurementType, propertyKey);
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
      legend: { show: !!propertyKey },
      grid: { bottom: 20, left: 50 },
      title: {
        text: `${property.name}${property.unit ? `(${property.unit})` : ''}`,
        subtext: propertyKey
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
            value = roundValue(data.values[key] as number, precision);
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
  if (Number.isNaN(value) || value === 0) return value;
  return round(value, precision ?? 3);
}

export function getKeysOfFirstClassFields(measurementType: number) {
  const type = Object.values(measurementTypes).find((type) => type.id === measurementType);
  return type ? type.firstClassFieldKeys : [];
}

function getFirstClassFields(measurement: MeasurementRow) {
  if (!measurement.properties) return [];
  const fields: (Property['fields'][0] & Pick<Property, 'precision' | 'unit'>)[] = [];
  getKeysOfFirstClassFields(measurement.type).forEach((fieldKey) => {
    for (const property of measurement.properties) {
      const field = property.fields.find((field) => field.key === fieldKey);
      if (field) {
        const name = field.name === property.name ? field.name : property.name;
        fields.push({ ...field, unit: property.unit, precision: property.precision, name });
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
    return properties.map(({ name, key, unit, precision }) => {
      let value = NaN;
      if (data && data.values) {
        value = roundValue(data.values[key] as number, precision);
      }
      return { name, value: getDisplayValue(value, unit) };
    });
    // .concat({
    //   name: '采集时间',
    //   value: data ? moment(data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'
    // });
  }
  return [];
}

export function getSpecificProperties(
  properties: Property[],
  measurementType: number,
  includeRemainProperties: boolean = true
) {
  const filterableProperties = properties.filter(({ isShow }) => isShow);
  const fieldKeysOfType = getKeysOfFirstClassFields(measurementType);
  const sorted: Property[] = [];
  fieldKeysOfType.forEach((fieldKey) => {
    const property = filterableProperties.find(({ fields }) =>
      fields.map(({ key }) => key).includes(fieldKey)
    );
    if (property) sorted.push(property);
  });
  if (includeRemainProperties) {
    filterableProperties.forEach((property) => {
      if (!sorted.map(({ key }) => key).includes(property.key)) sorted.push(property);
    });
  }
  return sorted;
}

export function removeDulpicateProperties(properties: Property[]) {
  const final = cloneDeep(properties);
  return final.map((property) => {
    const fields = property.fields;
    if (fields.every((field) => field.key === property.key)) {
      return { ...property, fields: [] };
    } else {
      return property;
    }
  });
}

export function generateLastestFlangeStatusChartOptions(
  points: MeasurementRow[],
  property: Property
) {
  if (!points || points.length === 0) return null;
  const series: any = [];
  const reals = points
    .filter((point) => point.type !== measurementTypes.flangePreload.id)
    .filter((point) => !!point.data);
  if (reals.length > 0) {
    series.push({
      type: 'scatter',
      name: `监测点`,
      data: reals.map(({ attributes, data }, n) => [
        attributes ? attributes?.index - 1 : 1,
        roundValue((data?.values[property.key] as number) || NaN)
      ])
    });
  }

  const fakes = points
    .filter((point) => point.type === measurementTypes.flangePreload.id)
    .filter((point) => !!point.data);
  if (fakes.length > 0) {
    series.push({
      type: 'line',
      name: `螺栓`,
      data: (fakes[0].data?.values[property.key] as number[]).map((val, index) => [
        index,
        roundValue(val)
      ])
    });
  }

  if (reals.length === 0 || fakes.length === 0) return null;

  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        let relVal = '';
        for (let i = 0; i < params.length; i++) {
          const index = Number(params[i].value[0]) + 1;
          const value = Number(params[i].value[1]);
          relVal += `<br/> ${params[i].marker} ${index}号${params[i].seriesName}: ${
            property.name
          }${getDisplayValue(value, property.unit)}`;
        }
        return relVal;
      }
    },
    grid: { bottom: 20, left: 50 },
    title: {
      text: `${property.name}${property.unit ? `(${property.unit})` : ''}`
    },
    series,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { align: 'left' },
      data: getXAxisData(fakes[0])
    },
    yAxis: { type: 'value' }
  };
}

function getXAxisData(fakePoint: MeasurementRow) {
  if (!fakePoint || !fakePoint.data || fakePoint.properties.length === 0) return [];
  return (fakePoint.data.values[fakePoint.properties[0].key] as number[]).map(
    (point, index) => index + 1
  );
}

export function generateFlangeStatusChartOptions(
  propertyKey: string,
  origialData?: FlangeStatusData
) {
  if (!origialData || origialData.values.length === 0) return null;
  const property = origialData.values.find(({ key }) => key === propertyKey);
  const series: any = [];
  const propertyInput = origialData.values.find(({ key }) => key === `${propertyKey}_input`);
  if (propertyInput) {
    const propertyInputDatas = propertyInput.data[propertyInput.name] as {
      index: number;
      value: number;
      timestamp: number;
    }[];
    if (propertyInputDatas.length > 0) {
      series.push({
        type: 'scatter',
        name: `监测点`,
        data: propertyInputDatas.map(({ index, value }) => [index - 1, roundValue(value)])
      });
    }
  }
  let xAxisDatas: number[] = [];
  const fake = origialData.values.find(({ fields }) =>
    fields.find((field) => field.key === propertyKey)
  );
  if (fake) {
    const field = fake.fields.find((field) => field.key === propertyKey);
    if (field) {
      const fakeDatas = fake.data[field.name] as number[];
      if (fakeDatas.length > 0) {
        xAxisDatas = fakeDatas.map((value, index) => index + 1);
        series.push({
          type: 'line',
          name: `螺栓`,
          data: fakeDatas.map((value, index) => [index, roundValue(value)])
        });
      }
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        let relVal = '';
        for (let i = 0; i < params.length; i++) {
          const index = Number(params[i].value[0]) + 1;
          const value = Number(params[i].value[1]);
          relVal += `<br/> ${params[i].marker} ${index}号${params[i].seriesName}: ${
            property?.name
          }${getDisplayValue(value, property?.unit)}`;
        }
        return relVal;
      }
    },
    legend: { show: !!propertyKey },
    grid: { bottom: 20, left: 50 },
    title: {
      text: `${property?.name}${property?.unit ? `(${property.unit})` : ''}`
    },
    series,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { align: 'left' },
      data: xAxisDatas
    },
    yAxis: { type: 'value' }
  };
}
