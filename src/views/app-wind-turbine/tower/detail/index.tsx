import React from 'react';
import { Col } from 'antd';
import intl from 'react-intl-universal';
import { oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import { Card, Grid, Tabs } from '../../../../components';
import {
  AssetRow,
  MONITORING_POINT_LIST,
  MonitoringPointRow,
  StatisticBar
} from '../../../asset-common';
import { useHistoryDatas } from '../../utils';
import { ActionBar } from '../../components/actionBar';
import { PointsTable } from '../../components/pointsTable';
import { History } from './history';
import { Update } from './update';

export const Index = (props: {
  asset: AssetRow;
  onSuccess: () => void;
  onUpdate: (m: MonitoringPointRow) => void;
}) => {
  const { asset, onSuccess, onUpdate } = props;
  const [activeKey, setActiveKey] = React.useState('monitoringPointList');
  const range = React.useRef<[number, number]>(oneWeekNumberRange);
  const historyDatas = useHistoryDatas(asset, range.current);
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
              label: intl.get(MONITORING_POINT_LIST),
              key: 'monitoringPointList',
              children: (
                <PointsTable
                  asset={asset}
                  onDeleteSuccess={onSuccess}
                  onUpdate={onUpdate}
                  showTitle={false}
                />
              )
            },
            {
              label: intl.get('HISTORY_DATA'),
              key: 'history',
              children: <History asset={asset} historyDatas={historyDatas} />
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
