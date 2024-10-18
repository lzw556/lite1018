import React from 'react';
import { Col, Row, TabsProps } from 'antd';
import intl from 'react-intl-universal';
import { generateColProps } from '../../../../utils/grid';
import { Card, Grid, Tabs } from '../../../../components';
import { oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import {
  StatisticBar,
  AssetRow,
  MONITORING_POINT_LIST,
  MonitoringPointRow
} from '../../../asset-common';
import { useHistoryDatas } from '../../utils';
import { ActionBar } from '../../components/actionBar';
import { PointsTable } from '../../components/pointsTable';
import * as Plain from '../plain';
import * as PreloadCalculation from '../preloadCalculation';
import { isFlangePreloadCalculation } from '../common';
import { History } from './history';
import { PointsScatterChart } from './pointsScatterChart';
import { Update } from './update';

export const Index = (props: {
  asset: AssetRow;
  onSuccess: () => void;
  onUpdate: (m: MonitoringPointRow) => void;
}) => {
  const { asset, onSuccess, onUpdate } = props;
  const [activeKey, setActiveKey] = React.useState('monitor');
  const range = React.useRef<[number, number]>(oneWeekNumberRange);
  const historyDatas = useHistoryDatas(asset, range.current);
  const items: TabsProps['items'] = [
    {
      label: intl.get('MONITOR'),
      key: 'monitor',
      children: (
        <Row gutter={[10, 10]}>
          <Col {...generateColProps({ xl: 12, xxl: 9 })}>
            <PointsScatterChart
              asset={asset}
              title={intl.get('BOLT_DIAGRAM')}
              big={true}
              style={{ height: 550 }}
            />
          </Col>
          <Col {...generateColProps({ xl: 12, xxl: 15 })}>
            {isFlangePreloadCalculation(asset) ? (
              <PreloadCalculation.RightConentInMonitorTab asset={asset} />
            ) : (
              <Plain.RightConentInMonitorTab asset={asset} historyDatas={historyDatas} />
            )}
          </Col>
        </Row>
      )
    },
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
      children: <History flange={asset} historyDatas={historyDatas} />
    }
  ];
  if (isFlangePreloadCalculation(asset)) {
    items.push({
      label: intl.get('FLANGE_STATUS'),
      key: 'status',
      children: <PreloadCalculation.Status {...asset} />
    });
  }
  items.push({
    label: intl.get('SETTINGS'),
    key: 'settings',
    children: <Update asset={asset} onSuccess={onSuccess} />
  });

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
          items={items}
          onChange={setActiveKey}
          tabBarExtraContent={{
            right: activeKey === 'monitoringPointList' && <ActionBar {...props} />
          }}
        />
      </Col>
    </Grid>
  );
};
