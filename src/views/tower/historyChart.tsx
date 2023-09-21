import React from 'react';
import { AssetRow } from '../asset/types';
import { getDisplayProperties, getRealPoints, HistoryData } from '../monitoring-point';
import intl from 'react-intl-universal';
import { MONITORING_POINTS } from '../../config/assetCategory.config';
import { useAppConfigContext } from '../asset';
import { PropertyChart, transformHistoryData } from '../../components/charts/propertyChart';
import dayjs from '../../utils/dayjsUtils';

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
  const propertiesOfFirstPoint = getDisplayProperties(firstPoint.properties, firstPoint.type);
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
      xAxisValues={Array.from(new Set(xAxisValues))
        .sort((prev, crt) => prev - crt)
        .map((t) => dayjs.unix(t).local().format('YYYY-MM-DD HH:mm:ss'))}
      yAxisMinInterval={selectedProperty.interval}
      yAxisValueMeta={{ precision: selectedProperty.precision, unit: selectedProperty.unit }}
    />
  );
};
