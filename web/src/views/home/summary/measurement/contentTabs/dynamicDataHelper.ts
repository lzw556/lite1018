import * as React from 'react';
import { AXIS_THREE } from '../../../../device/detail/dynamicData/constants';
import { getData, getDynamicData } from '../services';

export type DynamicDataType = {
  fields: { label: string; value: string; unit: string }[];
  metaData: { label: string; value: string; unit: string }[];
};

export type DynamicDataProperty = {
  [proName: string]: number[] | { xAxis: number; yAxis: number; zAxis: number }[] | number[][];
} & { metadata: { [proName: string]: any } };

export function useDynamicDataRequest<T>(id: number, range?: [number, number]) {
  const [timestamps, setTimestamps] = React.useState<{ timestamp: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [timestamp, setTimestamp] = React.useState<number>();
  const [dynamicData, setDynamicData] = React.useState<{
    timestamp: number;
    values: T;
  }>();
  const [loading2, setLoading2] = React.useState(true);
  React.useEffect(() => {
    if (range) {
      const [from, to] = range;
      getData(id, from, to, true).then((data) => {
        setTimestamps(data);
        setLoading(false);
      });
    }
  }, [range, id]);

  React.useEffect(() => {
    if (timestamps.length > 0) {
      setTimestamp(timestamps[0].timestamp);
    } else {
      setTimestamp(undefined);
    }
  }, [timestamps]);

  React.useEffect(() => {
    if (timestamp) {
      setLoading2(true);
      getDynamicData<T>(id, timestamp).then((data) => {
        setDynamicData(data);
        setLoading2(false);
      });
    }
  }, [id, timestamp]);

  return {
    all: { timestamps, loading },
    selected: {
      timestamp,
      dynamicData: { values: dynamicData?.values, loading: loading2 },
      setTimestamp
    }
  };
}

export function transformDynamicData(
  pro: DynamicDataProperty,
  field: { label: string; value: string }
) {
  const proValues = pro[field.value];
  if (!proValues || proValues.length === 0) return null;
  const firstValue = proValues[0];
  if (Array.isArray(firstValue)) {
    return [{ field, data: proValues as number[][] }];
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
  const series = values.map(({ field, data }) => ({ type: 'line', name: field.label, data }));
  if (series.length === 0) return undefined;
  let xAxis: any = {
    type: 'category'
  };
  if (!Array.isArray(series[0])) xAxis = { ...xAxis, data: Object.keys(series[0].data) };

  return {
    legend: {
      data: series.map(({ name }) => name)
    },
    title: { text: field.label, top: 0 },
    tooltip: {
      trigger: 'axis',
      formatter: (paras: any) => {
        return `<p>
          ${paras[0].dataIndex}
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
