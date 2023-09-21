import { Col, Empty, Row, Spin } from 'antd';
import React from 'react';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import { isMobile } from '../../../utils/deviceDetection';
import { getDataOfMonitoringPoint } from '../services';
import { HistoryData, MonitoringPointRow, MonitoringPointTypeValue } from '../types';
import intl from 'react-intl-universal';
import { CircleChart } from '../../tower/circleChart';
import { getDisplayProperties, getMonitoringPointType } from '../utils';
import { DisplayProperty } from '../../../constants/properties';
import { PropertyChart, transformHistoryData } from '../../../components/charts/propertyChart';
import { ChartHeader } from '../../../components/charts/chartHeader';

export const MonitoringPointMonitor = (point: MonitoringPointRow) => {
  const { id, name, type, attributes, properties } = point;
  const [loading, setLoading] = React.useState(true);
  const [historyData, setHistoryData] = React.useState<HistoryData>();
  const typeLabel = getMonitoringPointType(type);

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
    <Row gutter={[32, 32]}>
      {(type === MonitoringPointTypeValue.TOWER_INCLINATION ||
        type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT) && (
        <Col span={isMobile ? 24 : 6}>
          <CircleChart
            data={[
              {
                name,
                history: historyData,
                typeLabel: typeLabel ? intl.get(typeLabel) : '',
                height: attributes?.tower_install_height,
                radius: attributes?.tower_base_radius
              }
            ]}
          />
        </Col>
      )}
      {getDisplayProperties(properties, type).map((p: DisplayProperty, index: number) => {
        const { unit, precision } = p;
        const transform = transformHistoryData(historyData, p);
        return (
          <Col span={isMobile ? 24 : 6} key={index}>
            {transform && (
              <>
                <ChartHeader property={p} values={transform.lastValues} />
                <PropertyChart
                  series={transform.series}
                  withArea={true}
                  xAxisLabelLimit={true}
                  yAxisMinInterval={p.interval}
                  yAxisValueMeta={{ unit, precision }}
                />
              </>
            )}
          </Col>
        );
      })}
    </Row>
  );
};
