import { round } from 'lodash';
import moment from 'moment';
import { LineChartStyles } from '../../../constants/chart';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../../constants/color';
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
  // if (measurements.every(({ data }) => !data)) return null;
  if (false) {
    const firstClassFields = getFirstClassFields(measurements[0]);
    let field: any = null;
    if (firstClassFields.length > 0) {
      field = firstClassFields[0];
    }
    return {
      title: {
        text: '',
        left: 'center'
      },
      legend: {
        bottom: 0
      },
      tooltip: {
        trigger: 'axis',
        formatter: (paras: any) => {
          let text = '';
          paras.forEach(
            ({ seriesName, marker, value }: any) =>
              (text += `${generateRowOfTooltip(
                marker,
                seriesName,
                getDisplayValue(value, field.precision, field.unit)
              )}`)
          );
          return text;
        }
      },
      grid: { top: 80, bottom: '100' },
      xAxis: {
        type: 'category',
        show: false
      },
      yAxis: { type: 'value' },
      series: measurements.map((point) => {
        let data = NaN;
        if (field && point.data) {
          data = point.data.values[field.key];
          if (data) data = roundValue(data, field.precision);
        }
        return {
          type: 'bar',
          name: point.name,
          data: [data],
          barMaxWidth: 50,
          markLine: { symbol: 'none', data: getMarkLines(attributes) }
        };
      })
    };
  } else {
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
    radiusAxis.push(actuals.radiusAxis);
    series.push(actuals.series);
    let startIndex = 2;

    const legends = [];
    const scale = actuals.radius.radius / actuals.max;
    if (attributes?.normal) {
      const normal = getLine(
        attributes?.normal * scale,
        startIndex,
        ColorHealth,
        attributes.normal,
        '额定值'
      );
      legends.push({ name: '额定值', itemStyle: { color: ColorHealth } });
      polar.push(normal.radius);
      angleAxis.push(normal.angleAxis);
      radiusAxis.push(normal.radiusAxis);
      series.push(normal.series);
      startIndex++;
    }
    if (attributes?.info) {
      const info = getLine(
        attributes?.info * scale,
        startIndex,
        ColorInfo,
        attributes.info,
        '次要报警'
      );
      legends.push({ name: '次要报警', itemStyle: { color: ColorInfo } });
      polar.push(info.radius);
      angleAxis.push(info.angleAxis);
      radiusAxis.push(info.radiusAxis);
      series.push(info.series);
      startIndex++;
    }
    if (attributes?.warn) {
      const warn = getLine(
        attributes?.warn * scale,
        startIndex,
        ColorWarn,
        attributes.warn,
        '重要报警'
      );
      legends.push({ name: '重要报警', itemStyle: { color: ColorWarn } });
      polar.push(warn.radius);
      angleAxis.push(warn.angleAxis);
      radiusAxis.push(warn.radiusAxis);
      series.push(warn.series);
      startIndex++;
    }
    if (attributes?.danger) {
      const danger = getLine(
        attributes?.danger * scale,
        startIndex,
        ColorDanger,
        attributes.danger,
        '严重报警'
      );
      legends.push({ name: '严重报警', itemStyle: { color: ColorDanger } });
      polar.push(danger.radius);
      angleAxis.push(danger.angleAxis);
      radiusAxis.push(danger.radiusAxis);
      series.push(danger.series);
    }
    return {
      radar,
      polar,
      angleAxis,
      radiusAxis,
      legend: {
        data: legends,
        bottom: 0
      },
      series
    };
  }
}

function getMarkLines(attributes?: AssetRow['attributes']) {
  const values: { yAxis: number; lineStyle: { color: string } }[] = [];
  if (attributes) {
    if (attributes.info && Number(attributes.info)) {
      values.push({ yAxis: attributes.info, lineStyle: { color: ColorInfo } });
    }
    if (attributes.warn && Number(attributes.warn)) {
      values.push({ yAxis: attributes.warn, lineStyle: { color: ColorWarn } });
    }
    if (attributes.danger && Number(attributes.danger)) {
      values.push({ yAxis: attributes.danger, lineStyle: { color: ColorDanger } });
    }
  }
  return values;
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
      left: 80,
      subtext: crtProperty ? `${crtProperty.name}(${crtProperty.unit})` : ''
    },
    legend: { bottom: 0 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: any) =>
        `${getDisplayValue(value, crtProperty?.precision, crtProperty?.unit)}`
    },
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    series
  };
}

function generateOuter(measurements: MeasurementRow[], isBig: boolean = false) {
  const radius = { radius: isBig ? 180 : 150 };
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
      value = data.values[field.key];
      if (value) {
        value = roundValue(value, field.precision);
      }
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
        }${generateRowOfTooltip('', name, getDisplayValue(value, undefined, field?.unit))}`
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
  const radius = { radius: isBig ? 150 : 120 };
  const seriesData: any = [];
  const firstClassFields = getFirstClassFields(measurements[0]);
  let field: any = null;
  if (firstClassFields.length > 0) {
    field = firstClassFields[0];
  }
  let max = 0;
  measurements.forEach(({ data, name }, index) => {
    let value = 0;
    if (field && data) {
      value = data.values[field.key];
      if (value) {
        value = roundValue(value, field.precision);
        if (Math.abs(value) > max) max = Math.abs(value);
      }
    }
    seriesData.push([value, (index * 360) / measurements.length]);
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
    max
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
  return { series, max, radius, angleAxis, radiusAxis };
}

function getLine(rd: number, startIndex: number = 0, color: string, value: number, name: string) {
  const radius = { radius: rd };
  const angleAxis = {
    // axisLine: { show: true, lineStyle: { type: 'dashed', color } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    polarIndex: startIndex
  };
  const radiusAxis = {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false, formatter: 'ok' },
    splitLine: { show: false },
    polarIndex: startIndex
    // name: value,
    // nameGap: 0
  };
  const data = [];
  for (let index = 0; index < 360; index = index + 5) {
    data.push([value, index]);
  }
  const series = {
    type: 'line',
    coordinateSystem: 'polar',
    polarIndex: startIndex,
    data,
    symbol: 'none',
    name,
    lineStyle: { type: 'dashed', color }
  };
  return { radius, angleAxis, radiusAxis, series };
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
            if (crtField) value = crtProperty.data[field.name];
          }
          if (value) {
            value = roundValue(value, property.precision);
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
        value = property.data[field.name];
        if (value) {
          value = roundValue(value, property.precision);
        }
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
              undefined,
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
            value = data.values[key];
          }
          return getDisplayValue(value, precision);
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

function getDisplayValue(value: number | null | undefined, precision?: number, unit?: string) {
  if (Number.isNaN(value) || value === null || value === undefined) return '-';
  let finalValue = value;
  if (value) {
    finalValue = roundValue(value, precision);
  }
  return `${finalValue}${unit ?? ''}`;
}

function roundValue(value: number, precision?: number) {
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
          value = data.values[key];
        }
        return { name, value: getDisplayValue(value, precision, unit) };
      })
      .concat({
        name: '采集时间',
        value: data ? moment(data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-'
      });
  }
  return [];
}
