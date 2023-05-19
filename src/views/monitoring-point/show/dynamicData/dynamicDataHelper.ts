import * as React from 'react';
import { AXIS_THREE } from '../../../device/detail/dynamicData/constants';
import { getDataOfMonitoringPoint, getDynamicData, getDynamicDataVibration } from '../../services';
import { DataType } from '../../types';
import { LineChartStyles } from '../../../../constants/chart';

export type DynamicDataType = {
  fields: { label: string; value: string; unit: string }[];
  metaData: { label: string; value: string; unit: string }[];
};

export type VibrationWaveFormDataType = {
  frequency: number;
  highEnvelopes: number[];
  lowEnvelopes: number[];
  values: number[];
  xAxis: number[];
  xAxisUnit: string;
};

export type DynamicDataProperty = {
  [proName: string]: number[] | { xAxis: number; yAxis: number; zAxis: number }[] | number[][];
} & { metadata: { [proName: string]: any } };

export function useDynamicDataRequest<T>(
  id: number,
  dataType?: DataType,
  range?: [number, number],
  vibrationFilters?: { field: string; axis: number }
) {
  const [timestamps, setTimestamps] = React.useState<{
    dataType?: DataType;
    data: { timestamp: number }[];
  }>({ dataType, data: [] });
  const [loading, setLoading] = React.useState(true);
  const [timestamp, setTimestamp] = React.useState<{ dataType?: DataType; data: number }>();
  const [dynamicData, setDynamicData] = React.useState<{
    timestamp: number;
    values: T;
  }>();
  const [loading2, setLoading2] = React.useState(true);
  React.useEffect(() => {
    if (range && dataType) {
      const [from, to] = range;
      getDataOfMonitoringPoint(id, from, to, dataType).then((data) => {
        setTimestamps({ dataType, data });
        setLoading(false);
      });
    }
  }, [range, id, dataType]);

  React.useEffect(() => {
    if (timestamps.data.length > 0) {
      setTimestamp({ dataType: timestamps.dataType, data: timestamps.data[0].timestamp });
    } else {
      setTimestamp(undefined);
    }
  }, [timestamps]);

  React.useEffect(() => {
    if (timestamp && timestamp.dataType === dataType) {
      setLoading2(true);
      if (vibrationFilters) {
        getDynamicDataVibration<T>(id, timestamp.data, dataType, vibrationFilters).then((data) => {
          setDynamicData(data);
          setLoading2(false);
        });
      } else {
        getDynamicData<T>(id, timestamp.data, dataType).then((data) => {
          setDynamicData(data);
          setLoading2(false);
        });
      }
    }
  }, [id, timestamp, dataType, vibrationFilters]);

  return {
    all: { timestamps: timestamps.data, loading },
    selected: {
      timestamp: timestamp?.data,
      dynamicData: { values: dynamicData?.values, loading: loading2 },
      setTimestamp
    }
  };
}

export function transformDynamicData(
  pro: DynamicDataProperty,
  field: { label: string; value: string }
) {
  const proValues = pro.hasOwnProperty('mv')
    ? (combineDynamicDataDC(pro as any) as any)[field.value]
    : pro[field.value];
  if (!proValues || proValues.length === 0) return null;
  const firstValue = proValues[0];

  if (Array.isArray(firstValue)) {
    return [
      {
        field,
        data: (proValues as number[][]).map((val) => val.map((item) => Number(item.toFixed(3))))
      }
    ];
  } else if (typeof firstValue === 'object') {
    return [
      {
        field: AXIS_THREE[0],
        data: (proValues as { xAxis: number; yAxis: number; zAxis: number }[]).map(({ xAxis }) =>
          xAxis ? Number(xAxis.toFixed(3)) : xAxis
        )
      },
      {
        field: AXIS_THREE[1],
        data: (proValues as { xAxis: number; yAxis: number; zAxis: number }[]).map(({ yAxis }) =>
          yAxis ? Number(yAxis.toFixed(3)) : yAxis
        )
      },
      {
        field: AXIS_THREE[2],
        data: (proValues as { xAxis: number; yAxis: number; zAxis: number }[]).map(({ zAxis }) =>
          zAxis ? Number(zAxis.toFixed(3)) : zAxis
        )
      }
    ];
  } else {
    return [
      {
        field,
        data: (proValues as number[]).map((val: number) => (val ? Number(val.toFixed(3)) : val))
      }
    ];
  }
}

export function generateChartOptions(
  values:
    | {
        field: { label: string; value: string };
        data: number[] | number[][];
      }[]
    | null,
  field: { label: string; value: string; unit: string }
) {
  if (values === null) return undefined;
  const defaultChartOption = {
    grid: {
      left: '2%',
      right: '8%',
      bottom: '12%',
      containLabel: true,
      borderWidth: '0'
    },
    yAxis: { type: 'value' },
    animation: false,
    smooth: true,
    dataZoom: [
      {
        type: 'slider',
        show: true,
        startValue: 0,
        endValue: 3000,
        height: '32',
        zoomLock: false
      }
    ]
  };
  const seriesData = values.map(({ field, data }) => ({ name: field.label, data }));
  if (seriesData.length === 0 || seriesData[0].data.length === 0) return undefined;
  const isDC = Array.isArray(seriesData[0].data[0]);
  let xAxis: any = {
    type: 'category',
    data: Object.keys(seriesData[0].data)
  };
  //specific options for DC
  //1. series type is 'scatter'
  const type = 'line';
  //2. xAxis
  if (isDC) xAxis = { type: 'value', min: 'dataMin', max: 'dataMax' };
  //3. tooltip text -> below

  const series = seriesData.map((series) => ({
    ...series,
    type,
    smooth: isDC,
    symbol: isDC ? 'none' : 'emptyCircle'
  }));

  return {
    legend: {
      data: series.map(({ name }) => name)
    },
    title: { text: field.label, top: 0 },
    tooltip: {
      trigger: 'axis',
      formatter: (paras: any) => {
        return `<p>
          ${!isDC ? paras[0].dataIndex : ''}
          <br />
          ${paras
            .map(
              (para: any) =>
                `${para.marker}${para.seriesName} <strong>${para.data}</strong>${field.unit}`
            )
            .join('&nbsp;&nbsp;')}
        </p>`;
      }
    },
    xAxis,
    series,
    ...defaultChartOption
  };
}

export function combineDynamicDataDC(
  origin: DynamicDataProperty & { mv: number[]; tof: number[] }
) {
  return { ...origin, mv: origin.mv.map((item, index) => [origin.tof[index], item]) };
}

export function generateVibrationChartOptions(
  dimension: number,
  legends: [string, string, string],
  fieldLabel: string,
  data: VibrationWaveFormDataType,
  isShowEnvelope: boolean
) {
  const { frequency, values, xAxis, xAxisUnit, highEnvelopes, lowEnvelopes } = data;
  let series: any[] = [
    {
      name: legends[dimension],
      type: 'line',
      data: values,
      itemStyle: LineChartStyles[dimension].itemStyle,
      showSymbol: false
    }
  ];
  if (isShowEnvelope) {
    series = [
      {
        name: legends[dimension],
        type: 'line',
        data: highEnvelopes,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: '#ccc'
        },
        stack: 'confidence-band',
        symbol: 'none'
      },
      {
        name: legends[dimension],
        type: 'line',
        data: lowEnvelopes,
        lineStyle: {
          opacity: 0
        },
        areaStyle: {
          color: '#ccc'
        },
        stack: 'confidence-band',
        symbol: 'none'
      },
      ...series
    ];
  }

  return {
    grid: {
      left: '2%',
      right: '8%',
      bottom: '12%',
      containLabel: true,
      borderWidth: '0'
    },
    yAxis: { type: 'value' },
    animation: false,
    smooth: true,
    dataZoom: [
      {
        type: 'slider',
        show: true,
        startValue: 0,
        endValue: 3000,
        height: '32',
        zoomLock: false
      }
    ],
    legend: {
      data: [legends[dimension]],
      itemStyle: {
        color: LineChartStyles[dimension].itemStyle.color
      }
    },
    title: { text: `${fieldLabel} ${frequency / 1000}KHz`, top: 0 },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: `{b} ${data.xAxisUnit}<br/>${legends[dimension]}: {c}`
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      name: xAxisUnit
    },
    series: series
  };
}
