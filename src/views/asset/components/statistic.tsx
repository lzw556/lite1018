import { Col, Row, Statistic } from 'antd';
import React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { generateColProps } from '../../../utils/grid';
import { getAssetStatistics, NameValue, AssetRow } from '..';
import './overview-statistic.css';
import intl from 'react-intl-universal';

export const AssetAlarmStatistic = (asset: AssetRow) => {
  const [items, setItems] = React.useState<NameValue[]>([]);
  React.useEffect(() => {
    if (asset) {
      const { statistics } = asset;
      setItems(
        getAssetStatistics(
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
    <ShadowCard>
      <Row className='overview-statistic'>
        {items.map(({ name, value, className }, index) => (
          <Col span={4} key={index} {...generateColProps({ md: 12, lg: 12, xl: 4, xxl: 4 })}>
            <Statistic title={intl.get(name)} value={value} className={className} />
          </Col>
        ))}
      </Row>
    </ShadowCard>
  );
};
