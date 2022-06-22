import { round } from "lodash";
import moment from "moment";
import { LineChartStyles } from "../../../constants/chart";
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from "../../../constants/color";
import { AssetRow } from "../asset/props";
import { MeasurementRow, Property } from "../measurement/props";
import { MeasurementTypes } from "./constants";

export type HistoryData = {
  timestamp: number;
  values: Property[];
}[];
export function generateChartOptionsOfLastestData(measurements: MeasurementRow[], attributes?: AssetRow['attributes'], isBig: boolean = false) {
  const count = measurements.length;
  if (!count) return null;
  if(measurements.every(({data}) => !data)) return null;
  if (measurements[0].type === MeasurementTypes.loosening_angle.id) {
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
          paras.forEach(({ seriesName, marker, value }: any) => (text += `${generateRowOfTooltip(marker, seriesName, getDisplayValue(value, field.precision, field.unit))}`));
          return text;
        }
      },
      grid: { top: 80, bottom: '100'},
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
        return { type: 'bar', name: point.name, data: [data], barMaxWidth: 50, markLine: {symbol:'none', data: getMarkLines(attributes)} };
      })
    };
  } else {
    let radar:any = [];
    const polar: {radius:number}[] = [];
    const angleAxis:any = [];
    const radiusAxis:any = [];
    const series:any = [];
    const sortedMeasurements = measurements
    .sort((prev, next) => {
      const prevIndex = prev.attributes?.index || 5;
      const nextIndex = next.attributes?.index || 5;
      return prevIndex - nextIndex;
    })
    const outer = generateOuter(sortedMeasurements, isBig);
    polar.push(outer.radius);
    angleAxis.push(outer.angleAxis);
    radiusAxis.push(outer.radiusAxis);
    series.push(outer.series);

    const actuals = generateActuals(sortedMeasurements, isBig);
    series.push(actuals.series);
    radar.push(actuals.radar);
    let startIndex = 1;

    const scale = actuals.radius / actuals.max
    if(attributes?.normal){
      const normal = getLine(attributes?.normal * scale, startIndex, ColorHealth, attributes.normal);
      polar.push(normal.radius);
      angleAxis.push(normal.angleAxis);
      radiusAxis.push(normal.radiusAxis);
      startIndex ++;
    }
    if(attributes?.info){
      const info = getLine(attributes?.info * scale, startIndex, ColorInfo, attributes.info);
      polar.push(info.radius);
      angleAxis.push(info.angleAxis);
      radiusAxis.push(info.radiusAxis);
      startIndex ++;
    }
    if(attributes?.warn){
      const warn = getLine(attributes?.warn * scale, startIndex, ColorWarn, attributes.warn);
      polar.push(warn.radius);
      angleAxis.push(warn.angleAxis);
      radiusAxis.push(warn.radiusAxis);
      startIndex ++;
    }
    if(attributes?.danger){
      const danger = getLine(attributes?.danger * scale, startIndex, ColorDanger, attributes.danger);
      polar.push(danger.radius);
      angleAxis.push(danger.angleAxis);
      radiusAxis.push(danger.radiusAxis);
    }
    return {
      radar,
      polar,
      angleAxis,
      radiusAxis,
      legend: {
        data: [
          {
            name: '实际值',
            icon: 'circle'
          },
          {
            name: '报警值'
          }
        ],
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
  let crtProperty:any = null;
  const series = history.map(({name, data }) => {
    const { property, seriesData} = pickHistoryData(data, measurementType.firstClassFieldKeys[0]);
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
    tooltip: { trigger: 'axis', valueFormatter: (value: any) => `${getDisplayValue(value, crtProperty?.precision, crtProperty?.unit)}` },
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
  const seriesData = measurements.map(({ name, attributes }, index) => ({
      name,
      value: [1, index, `${name}`],
      label: {
        show: true,
        color: '#fff',
        formatter: (paras: any) => attributes?.index
      },
      tooltip: { formatter: '{b}' }
    }));
    const series = {
      type: 'scatter',
      name: 'outer',
      coordinateSystem: 'polar',
      polarIndex: 0,
      symbol:
        'path://M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z',
      symbolSize: 30,
      data: seriesData,
      itemStyle: {
        opacity: 1,
        color: '#555'
      },
      zlevel: 10
    }
  return { radius, angleAxis, radiusAxis, series };
}

function generateActuals(measurements: MeasurementRow[], isBig: boolean = false) {
  const radius = isBig ? 150 : 120;
  const seriesData:any =[] ;
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
        if (value > max) max = value;
      }
    }
    seriesData.push({name, value});
  });
  const radar = {
    axisName: { show: false },
    indicator: measurements.map(({ name }) => ({ name, max })),
    startAngle: 0,
    radius,
    axisLine: { show: false },
    splitLine: { show: false },
    splitArea: { show: false }
  };
  const series = {
    type: 'radar',
    name: '实际值',
    data: [{value: seriesData.map((item: any) => item.value)}],
    tooltip:{ formatter: ({marker, value}: any) => {
       let text = ''
       measurements.forEach(({name}, index) => {
         text += `${generateRowOfTooltip(marker, name, getDisplayValue(value[index], undefined, field?.unit))}`
       })
       return text;
    } },
    zlevel: 15
  }
  return { series, radar, max, radius };
}

function getLine(rd:number, startIndex: number = 0, color: string, value: number){
  const radius = { radius: rd };
  const angleAxis = {
    axisLine: { show: true, lineStyle: { type: 'dashed', color } },
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
    polarIndex: startIndex,
    name: value,
    nameGap: 0
  };
  return {radius, angleAxis, radiusAxis}
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
  return {property: crtProperty, seriesData};
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
            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${getDisplayValue(value, undefined, property.unit)}`;
          }
          return relVal;
        }
      },
      legend: { show: !!propertyName },
      grid: { bottom: 20, left: 50 },
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
        axisLabel: {align: 'left'},
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
          if(data && data.values){
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
          return measurement.data && measurement.data.timestamp ? moment(measurement.data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-';
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

function roundValue(value: number, precision?: number){
  return round(value, precision ?? 3)
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