import React from 'react';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../../localeProvider';
import { PropertyChart } from '../../../../components/charts/propertyChart';
import { getDisplayName, roundValue } from '../../../../utils/format';
import { MonitoringPointTypeValue } from '../../../../config';
import { Point, Points, MONITORING_POINT, MonitoringPointRow } from '../../../asset-common';

export const FakeVSRealChart = ({ points }: { points?: MonitoringPointRow[] }) => {
  const { language } = useLocaleContext();
  if (!points || points.length === 0) return null;
  const actuals = Points.filter(points).filter((point) => !!point.data);
  const fakes = points
    .filter((point) => point.type === MonitoringPointTypeValue.FLANGE_PRELOAD)
    .filter((point) => !!point.data);
  if (actuals.length === 0 || fakes.length === 0) return null;
  const properties = Point.getPropertiesByType(actuals[0].properties, actuals[0].type);
  if (properties.length === 0) return null;
  const property = properties[0];
  const { precision, unit, name, key, interval } = property;

  return (
    <PropertyChart
      rawOptions={{
        title: { text: getDisplayName({ name: intl.get(name), suffix: unit, lang: language }) }
      }}
      series={[
        {
          data: {
            [intl.get(MONITORING_POINT)]: actuals.map(({ data }) =>
              roundValue((data?.values[key] as number) || NaN)
            )
          },
          raw: { symbol: 'circle', type: 'scatter' },
          xAxisValues: actuals.map(({ attributes }) => (attributes ? `${attributes.index}` : '1'))
        },
        {
          data: {
            [intl.get('BOLT')]: (fakes[0].data?.values[key] as number[]).map((val) =>
              roundValue(val)
            )
          },
          xAxisValues: getXAxisData(fakes[0]).map((n) => `${n}`),
          main: true
        }
      ]}
      style={{ height: 550 }}
      yAxis={{ interval, precision, unit }}
    />
  );
};

function getXAxisData(fakePoint: MonitoringPointRow) {
  if (!fakePoint || !fakePoint.data || fakePoint.properties.length === 0) return [];
  return (fakePoint.data.values[fakePoint.properties[0].key] as number[]).map(
    (point, index) => index + 1
  );
}
