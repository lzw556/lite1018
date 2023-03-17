import { Col, Row, Statistic } from 'antd';
import React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { generateColProps } from '../../../utils/grid';
import { getAssetStatistics, NameValue, AssetRow } from '..';
import './overview-statistic.css';

export const AssetAlarmStatistic = (asset: AssetRow) => {
  const [items, setItems] = React.useState<NameValue[]>([]);
  React.useEffect(() => {
    if (asset) {
      const { statistics } = asset;
      setItems(
        getAssetStatistics(
          statistics,
          'monitoringPointNum',
          ['danger', '紧急报警监测点'],
          ['warn', '重要报警监测点'],
          ['info', '次要报警监测点'],
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
            <Statistic title={name} value={value} className={className} />
          </Col>
        ))}
      </Row>
    </ShadowCard>
  );
};
