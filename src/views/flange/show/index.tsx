import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, TabsProps } from 'antd';
import React from 'react';
import { checkIsFlangePreload } from '..';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import { TabsCard } from '../../../components/tabsCard';
import usePermission, { Permission } from '../../../permission/permission';
import { AssetAlarmStatistic, AssetRow, useAssetsContext } from '../../asset';
import {
  getDataOfMonitoringPoint,
  getRealPoints,
  HistoryData,
  MONITORING_POINT,
  MONITORING_POINT_LIST
} from '../../monitoring-point';
import { FlangeHistory } from './history';
import { FlangeMonitoringPointList } from './list';
import { FlangeMonitor } from './monitor';
import { FlangeSet } from './settings';
import { FakeFlangeStatus } from './status';
import intl from 'react-intl-universal';
import { useActionBarStatus } from '../../asset/common/useActionBarStatus';
import { ActionBar } from '../../asset/common/actionBar';

export default function FlangeShow({
  flange,
  fetchFlange
}: {
  flange: AssetRow;
  fetchFlange: (id: number) => void;
}) {
  const { id } = flange;
  const { refresh } = useAssetsContext();
  const [tabKey, setTabKey] = React.useState('');
  const actionStatus = useActionBarStatus();
  const range = React.useRef<[number, number]>(oneWeekNumberRange);
  const historyDatas = useHistoryDatas(flange, range.current);

  const { hasPermission } = usePermission();

  const items: TabsProps['items'] = [
    {
      key: 'monitor',
      label: intl.get('MONITOR'),
      children: <FlangeMonitor flange={flange} historyDatas={historyDatas} />
    },
    {
      key: 'monitoringPointList',
      label: intl.get(MONITORING_POINT_LIST),
      children: (
        <FlangeMonitoringPointList
          flange={flange}
          onUpdate={(point) => {
            actionStatus.onMonitoringPointUpdate?.(point);
          }}
          onDeleteSuccess={() => fetchFlange(id)}
        />
      )
    },
    {
      key: 'history',
      label: intl.get('HISTORY_DATA'),
      children: <FlangeHistory flange={flange} historyDatas={historyDatas} key={flange.id} />
    }
  ];
  if (checkIsFlangePreload(flange)) {
    items.push({
      key: 'flangeSatus',
      label: intl.get('FLANGE_STATUS'),
      children: <FakeFlangeStatus {...flange} />
    });
  }
  if (hasPermission(Permission.AssetEdit)) {
    items.push({
      key: 'settings',
      label: intl.get('SETTINGS'),
      children: (
        <FlangeSet
          flange={flange}
          onUpdateSuccess={() => {
            fetchFlange(id);
            refresh();
          }}
        />
      )
    });
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetAlarmStatistic {...flange} />
      </Col>
      <Col span={24}>
        <TabsCard
          items={items}
          onChange={setTabKey}
          tabBarExtraContent={
            tabKey === 'monitoringPointList' && (
              <ActionBar
                hasPermission={hasPermission(Permission.AssetAdd)}
                actions={[
                  <Button
                    key='monitoring-point-create'
                    type='primary'
                    onClick={() => actionStatus.onMonitoringPointCreate(flange)}
                  >
                    {intl.get('CREATE_SOMETHING', { something: intl.get(MONITORING_POINT) })}
                    <PlusOutlined />
                  </Button>
                ]}
                {...actionStatus}
                onSuccess={() => {
                  fetchFlange(id);
                  refresh();
                }}
              />
            )
          }
        />
      </Col>
    </Row>
  );
}

export function useHistoryDatas(flange?: AssetRow, range?: [number, number]) {
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryData }[] | undefined
  >();
  React.useEffect(() => {
    const points = getRealPoints(flange?.monitoringPoints);
    if (points.length > 0 && range) {
      const [from, to] = range;
      const fetchs = points.map(({ id }) => getDataOfMonitoringPoint(id, from, to));
      Promise.all(fetchs).then((datas) =>
        setHistoryDatas(datas.map((data, index) => ({ name: points[index].name, data })))
      );
    }
  }, [flange, range]);
  return historyDatas;
}
