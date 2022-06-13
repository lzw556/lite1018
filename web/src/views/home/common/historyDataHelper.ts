import { round } from "lodash";
import moment from "moment";
import { LineChartStyles } from "../../../constants/chart";
import { MeasurementRow, Property } from "../measurement/props";
import { MeasurementTypes } from "./constants";

export type HistoryData = {
  timestamp: number;
  values: Property[];
}[];
export function generateChartOptionsOfLastestData(measurements: MeasurementRow[], size: { inner: string; outer: string }) {
  const count = measurements.length;
  if (!count) return null;
  const actuals = generateActuals(measurements);
  let minActual = actuals[0][0];
  let maxActual = actuals[0][0];
  actuals.forEach(([value, angle]) => {
    if (!Number.isNaN(value)) {
      if (value > maxActual || Number.isNaN(maxActual)) maxActual = value;
      if (value < minActual || Number.isNaN(minActual)) minActual = value;
    }
  });
  const factor = maxActual - minActual > 0 ? (maxActual - minActual) / 2 : Math.abs(maxActual) / 2;
  minActual = Math.ceil(minActual - factor);
  maxActual = Math.ceil(maxActual + factor);

  const circleMax = maxActual + 1;
  const _maxinum = generateCircle(measurements, circleMax);
  const specification = generateSpecification((minActual + maxActual) / 2);
  if (measurements[0].type === MeasurementTypes.loosening_angle.id) {
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
          paras.forEach(({ seriesName, marker, value }: any) => (text += `${marker} ${seriesName} ${value} <br />`));
          return text;
        }
      },
      xAxis: {
        type: 'category',
        show: false
      },
      yAxis: { type: 'value' },
      series: measurements.map((point) => {
        let data = NaN;
        const firstClassFieldKeys = getKeysOfFirstClassFields(point.type);
        if (firstClassFieldKeys.length > 0 && point.data) data = point.data.values[firstClassFieldKeys[0]];
        return { type: 'bar', name: point.name, data: [data], barMaxWidth: 50 };
      })
    };
  } else {
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
          type: 'category',
          polarIndex: 1,
          startAngle: 0,
          clockwise: false,
          boundaryGap: false,
          axisLine: { show: true, lineStyle: { type: 'dashed' } },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          data: measurements.map((point) => point.name)
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
          max: circleMax + 1
        }
      ],
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
      series: [
        {
          type: 'line',
          name: '实际值',
          coordinateSystem: 'polar',
          lineStyle: { color: '#00800080' },
          itemStyle: { color: '#00800080' },
          data: actuals,
          tooltip: {
            formatter: (params: any) => {
              return `${params.data[0]}`;
            }
          }
        },
        {
          type: 'line',
          name: '报警值',
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
}

export function generateChartOptionsOfHistoryData(
  history: { name: string; data: HistoryData }[],
  measurementType: typeof MeasurementTypes.loosening_angle
) {
  const series = history.map(({name, data }) => {
    return {
      type: 'line',
      name,
      data: pickHistoryData(data, measurementType.firstClassFieldKeys[0]).map(({data}) => data)
    };
  });

  return {
    title: {
      text: '',
      left: 'center'
    },
    legend: { bottom: 0 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'time' },
    // yAxis: { type: 'value', min: 290, max: 360 },
    yAxis: { type: 'value' },
    series
  };
}

function generateActuals(measurements: MeasurementRow[]) {
  const actuals: number[][] = [];
  const interval = 360 / measurements.length;
  let first = 0;
  measurements
    .sort((prev, next) => {
      const prevIndex = prev.attributes?.index || 5;
      const nextIndex = next.attributes?.index || 5;
      return prevIndex - nextIndex;
    })
    .forEach((point, index) => {
      let data = NaN;
      const firstClassFieldKeys = getKeysOfFirstClassFields(point.type);
      if (firstClassFieldKeys.length > 0 && point.data) data = point.data.values[firstClassFieldKeys[0]];
      actuals.push([data, index * interval]);
      if (index === 0) first = data;
    });
  return actuals.concat([[first, 360]]);
}

function generateSpecification(max: number) {
  const maxinum = [];
  for (let index = 360; index > 0; index = index - 3) {
    maxinum.push([max, index]);
  }
  return maxinum;
}

function generateCircle(measurements: MeasurementRow[], max: number) {
  return measurements
    .sort((prev, next) => {
      const prevIndex = prev.attributes?.index || 5;
      const nextIndex = next.attributes?.index || 5;
      return prevIndex - nextIndex;
    })
    .map(({ name, attributes }) => ({
      name,
      value: max,
      label: {
        show: true,
        color: '#fff',
        formatter: (paras: any) => attributes?.index
      },
      tooltip: { formatter: '{b}' }
    }));
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

export function pickHistoryData(data: HistoryData, propertyName: string) {
  return data.map(({ timestamp, values }) => {
    let value = NaN;
    let crtProperty = null;
    for (const property of values) {
      const field = property.fields.find(({ key }) => key === propertyName);
      if (field) {
        crtProperty = property;
        value = property.data[field.name];
        if (value) {
          const precision = property.precision ?? 3;
          value = round(value, precision);
        }
        break;
      }
    }
    return {
      property: crtProperty,
      data: [moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss'), value]
    };
  });
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
      .map(({ name, key, unit }) => ({
        title: `${name}${unit ? `(${unit})` : ''}`,
        key,
        render: ({ data }: MeasurementRow) => {
          return data ? data.values[key].toString() : '-';
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