import React from 'react';
import { ChartContainer } from '../../components/charts/chartContainer';
import dayjs from '../../utils/dayjsUtils';
import { isMobile } from '../../utils/deviceDetection';
import { getDisplayValue } from '../../utils/format';
import { AssetRow } from '../asset/types';
import { MONITORING_POINTS } from '../asset/wind-turbine';
import {
  getHistoryDatas,
  getRealPoints,
  HistoryData,
  MonitoringPointTypeValue,
  Property
} from '../monitoring-point';
import intl from 'react-intl-universal';

export const FlangeHistoryChart = ({
  historyDatas,
  flange,
  propertyKey,
  showTitle = true
}: {
  historyDatas: { name: string; data: HistoryData }[] | undefined;
  flange: AssetRow;
  propertyKey?: string;
  showTitle?: boolean;
}) => {
  const points = getRealPoints(flange.monitoringPoints);
  const firstPoint = points[0];
  const selectedProperty =
    firstPoint.properties.find((p) => p.key === propertyKey) ?? firstPoint.properties[0];

  if (points.length === 0) return <p>信息异常</p>;

  const title = showTitle
    ? `${intl.get('OBJECT_TREND_CHART', {
        object: intl.get(MONITORING_POINTS.find((m) => m.id === firstPoint.type)?.label ?? '')
      })}`
    : '';

  return (
    <ChartContainer
      options={buildTrendChartOfFlange(historyDatas, selectedProperty, firstPoint.type) as any}
      title={title}
      style={{ height: 550 }}
    />
  );
};

export function buildTrendChartOfFlange(
  history: { name: string; data: HistoryData }[] | undefined,
  property: Property,
  type: number
) {
  if (history === undefined) return null;
  const series = history.map(({ name, data }) => {
    const datas = getHistoryDatas(data, type, property.key);
    let _data: [string, number][] = [];
    datas.forEach(({ times, seriesData, property: _property }) => {
      if (property.key === _property.key) {
        const _series = seriesData.find(({ name }) => name === property.name);
        if (_series) {
          times.map((time, index) =>
            _data.push([
              dayjs.unix(time).local().format('YYYY-MM-DD HH:mm:ss'),
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
      showSymbol: _data.length === 1
    };
  });

  return {
    title: {
      text: '',
      left: isMobile ? 0 : 80,
      subtext: property ? `${intl.get(property.name)}(${property.unit})` : ''
    },
    legend: { bottom: 0 },
    grid: { bottom: isMobile ? 120 : 60 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: any) => `${getDisplayValue(value, property?.unit)}`
    },
    xAxis: { type: 'time' },
    yAxis:
      type === MonitoringPointTypeValue.PRELOAD
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
