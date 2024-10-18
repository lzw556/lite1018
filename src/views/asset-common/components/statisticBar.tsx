import React from 'react';
import { Col, Row, Statistic } from 'antd';
import intl from 'react-intl-universal';
import { generateColProps } from '../../../utils/grid';
import { NameValue } from '../utils/statistics';
import { AssetRow } from '../types';
import { Asset } from '..';

export const StatisticBar = ({ asset }: { asset: AssetRow }) => {
  const [items, setItems] = React.useState<NameValue[]>([]);
  React.useEffect(() => {
    if (asset) {
      const { statistics } = asset;
      setItems(
        Asset.resolveStatistics(
          statistics,
          'monitoringPointNum',
          ['danger', 'MONITORING_POINT_CRITICAL'],
          ['warn', 'MONITORING_POINT_MAJOR'],
          ['info', 'MONITORING_POINT_MINOR'],
          'deviceNum',
          'offlineDeviceNum'
        ).statistics
      );
    }
  }, [asset]);

  return (
    <Row className='overview-statistic'>
      {items.map(({ name, value, className }, index) => (
        <Col key={index} {...generateColProps({ md: 12, lg: 12, xl: 4, xxl: 4 })}>
          <Statistic title={intl.get(name)} value={value} className={className} />
        </Col>
      ))}
    </Row>
  );
};
