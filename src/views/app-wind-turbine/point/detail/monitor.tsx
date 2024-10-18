import React from 'react';
import { Col, Empty, Spin } from 'antd';
import intl from 'react-intl-universal';
import { generateColProps } from '../../../../utils/grid';
import { Grid } from '../../../../components';
import { oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import { PropertyChart, transformHistoryData } from '../../../../components/charts/propertyChart';
import { ChartHeader } from '../../../../components/charts/chartHeader';
import { DisplayProperty } from '../../../../constants/properties';
import {
  getDataOfMonitoringPoint,
  HistoryData,
  MonitoringPointRow,
  Point
} from '../../../asset-common';
import * as Tower from '../../tower';

export const Monitor = (point: MonitoringPointRow) => {
  const { id, name, type, attributes, properties } = point;
  const [loading, setLoading] = React.useState(true);
  const [historyData, setHistoryData] = React.useState<HistoryData>();
  const typeLabel = Point.getTypeLabel(type);
  const colProps = generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 });

  React.useEffect(() => {
    const [from, to] = oneWeekNumberRange;
    getDataOfMonitoringPoint(id, from, to).then((data) => {
      setLoading(false);
      if (data.length > 0) {
        setHistoryData(data);
      } else {
        setHistoryData(undefined);
      }
    });
  }, [id, type]);

  if (loading) return <Spin />;
  if (!historyData || historyData.length === 0)
    return <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <Grid gutter={[12, 12]}>
      {Point.Assert.isTowerRelated(type) && (
        <Col {...colProps}>
          <Tower.PointsScatterChart
            data={[
              {
                name,
                history: historyData,
                typeLabel: typeLabel ? intl.get(typeLabel) : '',
                height: attributes?.tower_install_height,
                radius: attributes?.tower_base_radius
              }
            ]}
            type={type}
          />
        </Col>
      )}
      {Point.getPropertiesByType(properties, type).map((p: DisplayProperty, index: number) => {
        const transform = transformHistoryData(historyData, p);
        return (
          <Col {...colProps} key={index}>
            {transform && (
              <>
                <ChartHeader property={p} values={transform.values} />
                <PropertyChart
                  series={transform.series}
                  withArea={true}
                  xAxis={{ labelLimit: true }}
                  yAxis={p}
                />
              </>
            )}
          </Col>
        );
      })}
    </Grid>
  );
};
