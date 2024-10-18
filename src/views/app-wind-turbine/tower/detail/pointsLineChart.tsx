import React from 'react';
import intl from 'react-intl-universal';
import { PropertyChart, transformHistoryData } from '../../../../components/charts/propertyChart';
import dayjs from '../../../../utils/dayjsUtils';
import { AssetRow, HistoryData, Point, Points } from '../../../asset-common';

export const PointsLineChart = ({
  historyDatas,
  asset,
  propertyKey,
  showTitle = true
}: {
  historyDatas: { name: string; data: HistoryData }[] | undefined;
  asset: AssetRow;
  propertyKey?: string;
  showTitle?: boolean;
}) => {
  const points = Points.filter(asset.monitoringPoints);
  const firstPoint = points[0];
  const propertiesOfFirstPoint = Point.getPropertiesByType(firstPoint.properties, firstPoint.type);
  const selectedProperty =
    propertiesOfFirstPoint.find((p) => p.key === propertyKey) ?? propertiesOfFirstPoint[0];

  if (points.length === 0) return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;

  const title = showTitle
    ? `${intl.get('OBJECT_TREND_CHART', {
        object: intl.get(selectedProperty.name)
      })}`
    : '';

  let series: any = [];
  const xAxisValues: number[] = [];
  if (historyDatas === undefined) return null;
  historyDatas.forEach(({ name, data }) => {
    xAxisValues.push(...data.map(({ timestamp }) => timestamp));
    const transformed = transformHistoryData(data, selectedProperty, { prefix: name });
    if (transformed?.series) {
      series.push(...transformed.series);
    }
  });

  return (
    <PropertyChart
      rawOptions={{ title: { text: title } }}
      series={series}
      style={{ height: 550 }}
      xAxis={{
        data: Array.from(new Set(xAxisValues))
          .sort((prev, crt) => prev - crt)
          .map((t) => dayjs.unix(t).local().format('YYYY-MM-DD HH:mm:ss'))
      }}
      yAxis={selectedProperty}
    />
  );
};
