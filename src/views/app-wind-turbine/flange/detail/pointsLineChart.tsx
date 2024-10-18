import React from 'react';
import { Empty } from 'antd';
import intl from 'react-intl-universal';
import { PropertyChart, transformHistoryData } from '../../../../components/charts/propertyChart';
import dayjs from '../../../../utils/dayjsUtils';
import { AssetRow, HistoryData, Point, Points } from '../../../asset-common';

export const PointsLineChart = ({
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
  const points = Points.filter(flange.monitoringPoints);

  if (points.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const firstPoint = points[0];
  const properties = Point.getPropertiesByType(firstPoint.properties, firstPoint.type);
  const selectedProperty = properties.find((p) => p.key === propertyKey) ?? properties[0];

  const title = showTitle
    ? `${intl.get('OBJECT_TREND_CHART', {
        object: intl.get(selectedProperty.name)
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
