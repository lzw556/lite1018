import React from 'react';
import { ChartContainer } from '../../components/charts/chartContainer';
import { getDisplayValue, roundValue } from '../../utils/format';
import {
  MonitoringPointRow,
  MonitoringPointTypeValue,
  getRealPoints,
  MONITORING_POINT
} from '../monitoring-point';
import intl from 'react-intl-universal';

export const FlangePreloadChart = ({ points }: { points: MonitoringPointRow[] }) => {
  return (
    <ChartContainer
      options={buildFlangePreloadChart(points) as any}
      title=''
      style={{ height: 550 }}
    />
  );
};

export function buildFlangePreloadChart(points: MonitoringPointRow[]) {
  if (!points || points.length === 0) return null;
  const series: any = [];
  const reals = getRealPoints(points).filter((point) => !!point.data);
  const fakes = points
    .filter((point) => point.type === MonitoringPointTypeValue.FLANGE_PRELOAD)
    .filter((point) => !!point.data);
  if (reals.length === 0 || fakes.length === 0) return null;
  const property = reals[0].properties[0];
  series.push({
    type: 'scatter',
    name: intl.get(MONITORING_POINT),
    data: reals.map(({ attributes, data }, n) => [
      attributes ? attributes?.index - 1 : 1,
      roundValue((data?.values[property.key] as number) || NaN)
    ])
  });

  series.push({
    type: 'line',
    name: intl.get('BOLT'),
    data: (fakes[0].data?.values[property.key] as number[]).map((val, index) => [
      index,
      roundValue(val)
    ])
  });
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        let relVal = '';
        for (let i = 0; i < params.length; i++) {
          const index = Number(params[i].value[0]) + 1;
          const value = Number(params[i].value[1]);
          relVal += `<br/> ${params[i].marker} ${intl.get('INDEXED_NUMBER', { index })}${
            params[i].seriesName
          }: ${intl.get(property.name)}${getDisplayValue(value, property.unit)}`;
        }
        return relVal;
      }
    },
    grid: { bottom: 20, left: 50 },
    title: {
      text: `${intl.get(property.name)}${property.unit ? `(${property.unit})` : ''}`
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

function getXAxisData(fakePoint: MonitoringPointRow) {
  if (!fakePoint || !fakePoint.data || fakePoint.properties.length === 0) return [];
  return (fakePoint.data.values[fakePoint.properties[0].key] as number[]).map(
    (point, index) => index + 1
  );
}
