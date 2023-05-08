import React from 'react';
import { ChartContainer } from '../../components/charts/chartContainer';
import dayjs from '../../utils/dayjsUtils';
import { isMobile } from '../../utils/deviceDetection';
import { getDisplayValue } from '../../utils/format';
import { AssetRow } from '../asset/types';
import {
  getHistoryDatas,
  getRealPoints,
  getSpecificProperties,
  HistoryData,
  MonitoringPointTypeValue,
  Property
} from '../monitoring-point';
import intl from 'react-intl-universal';
import { MONITORING_POINTS } from '../../config/assetCategory.config';
import { useAppConfigContext } from '../asset';

export const TowerHistoryChart = ({
  historyDatas,
  tower,
  propertyKey,
  showTitle = true
}: {
  historyDatas: { name: string; data: HistoryData }[] | undefined;
  tower: AssetRow;
  propertyKey?: string;
  showTitle?: boolean;
}) => {
  const config = useAppConfigContext();
  const points = getRealPoints(tower.monitoringPoints);
  const firstPoint = points[0];
  const propertiesOfFirstPoint = getSpecificProperties(firstPoint.properties, firstPoint.type);
  const selectedProperty =
    propertiesOfFirstPoint.find((p) => p.key === propertyKey) ?? propertiesOfFirstPoint[0];

  if (points.length === 0) return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;

  const title = showTitle
    ? `${intl.get('OBJECT_TREND_CHART', {
        object: intl.get(
          MONITORING_POINTS.get(config)?.find((m) => m.id === firstPoint.type)?.label ?? ''
        )
      })}`
    : '';

  return (
    <ChartContainer
      options={buildTrendChartOfTower(historyDatas, selectedProperty, firstPoint.type) as any}
      title={title}
      style={{ height: 550 }}
    />
  );
};

export function buildTrendChartOfTower(
  history: { name: string; data: HistoryData }[] | undefined,
  property: Property,
  type: number
) {
  let series: any = [];
  if (history === undefined) return null;
  if (
    property.name === 'FIELD_INCLINATION_COMBINED' ||
    property.name === 'FIELD_DISPLACEMENT_COMBINED'
  ) {
    history.forEach(({ name, data }) => {
      const datas = getHistoryDatas(data, type, property.key);
      const seriesItems: any = [];
      datas.forEach(({ times, seriesData, property: _property }) => {
        const timeStrs = times.map((t) => dayjs.unix(t).local().format('YYYY-MM-DD HH:mm:ss'));
        seriesData.forEach((s) => {
          seriesItems.push({
            type: 'line',
            name: `${name} ${intl.get(s.name)}`,
            data: timeStrs.map((t, i) => [t, s.data[i]]),
            showSymbol: false
          });
        });
      });
      series.push(...seriesItems);
    });
  } else {
    series = history.map(({ name, data }) => {
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
  }

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
            ...calculateRangeOfAngle(
              series.map(({ data }: any) => data.map((item: any) => item[1]))
            )
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
