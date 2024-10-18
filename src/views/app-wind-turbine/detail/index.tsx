import React from 'react';
import { Col, Empty } from 'antd';
import intl from 'react-intl-universal';
import { Card, Grid, Tabs } from '../../../components';
import { generateColProps } from '../../../utils/grid';
import {
  AssetRow,
  MONITORING_POINT_LIST,
  MonitoringPointRow,
  StatisticBar
} from '../../asset-common';
import { ActionBar } from '../components/actionBar';
import { PointsTable } from '../components/pointsTable';
import { Update } from './update';
import { OverviewCard } from './overviewCard';

export const Index = (props: {
  asset: AssetRow;
  onSuccess: () => void;
  onUpdate: (m: MonitoringPointRow) => void;
}) => {
  const { asset, onSuccess, onUpdate } = props;
  const [activeKey, setActiveKey] = React.useState('monitor');

  const renderAssetList = (content: React.ReactNode) => {
    return (asset.children?.length ?? 0) > 0 ? (
      content
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  return (
    <Grid>
      <Col span={24}>
        <Card>
          <StatisticBar asset={asset} />
        </Card>
      </Col>
      <Col span={24}>
        <Tabs
          activeKey={activeKey}
          items={[
            {
              label: intl.get('MONITOR'),
              key: 'monitor',
              children: renderAssetList(
                <Grid gutter={[12, 12]}>
                  {asset.children?.map((a) => (
                    <Col key={a.id} {...generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 })}>
                      <OverviewCard asset={a} />
                    </Col>
                  ))}
                </Grid>
              )
            },
            {
              label: intl.get(MONITORING_POINT_LIST),
              key: 'monitoringPointList',
              children: renderAssetList(
                asset.children?.map((a) => (
                  <PointsTable
                    asset={a}
                    onDeleteSuccess={onSuccess}
                    onUpdate={onUpdate}
                    key={a.id}
                  />
                ))
              )
            },
            {
              label: intl.get('SETTINGS'),
              key: 'settings',
              children: <Update asset={asset} onSuccess={onSuccess} />
            }
          ]}
          onChange={setActiveKey}
          tabBarExtraContent={{
            right: activeKey === 'monitoringPointList' && <ActionBar {...props} />
          }}
        />
      </Col>
    </Grid>
  );
};
