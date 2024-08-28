import React from 'react';
import dayjs from '../../utils/dayjsUtils';
import { AssetRow } from '../asset/types';
import { getDisplayProperties, getRealPoints, HistoryData } from '../monitoring-point';
import intl from 'react-intl-universal';
import { MONITORING_POINTS } from '../../config/assetCategory.config';
import { useAppConfigContext } from '../asset';
import { PropertyChart, transformHistoryData } from '../../components/charts/propertyChart';

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
  const config = useAppConfigContext();
  const points = getRealPoints(flange.monitoringPoints);
  const firstPoint = points[0];
  const properties = getDisplayProperties(firstPoint.properties, firstPoint.type);
  const selectedProperty = properties.find((p) => p.key === propertyKey) ?? properties[0];

  if (points.length === 0) return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;

  const title = showTitle
    ? `${intl.get('OBJECT_TREND_CHART', {
        object: intl.get(
          MONITORING_POINTS.get(config.type)?.find((m) => m.id === firstPoint.type)?.label ?? ''
        )
      })}`
    : '';

  if (historyDatas === undefined) return null;
  const xAxisValues: number[] = [];
  const series: any = [];
  historyDatas.forEach(({ name, data }) => {
    xAxisValues.push(...data.map(({ timestamp }) => timestamp));
    const transformed = transformHistoryData(data, selectedProperty, { replace: name });
    if (transformed?.series) {
      series.push(...transformed.series);
    }
  });

  return (
    <PropertyChart
      rawOptions={{ title: { text: title } }}
      series={series}
      style={{ height: 500 }}
      xAxis={{
        data: Array.from(new Set(xAxisValues))
          .sort((prev, crt) => prev - crt)
          .map((t) => dayjs.unix(t).local().format('YYYY-MM-DD HH:mm:ss'))
      }}
      yAxis={selectedProperty}
    />
  );
};
