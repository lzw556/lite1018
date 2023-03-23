import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Spin, TabsProps } from 'antd';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { checkIsFlangePreload } from '../..';
import { oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import { TabsCard } from '../../../../components/tabsCard';
import usePermission, { Permission } from '../../../../permission/permission';
import {
  AssetAlarmStatistic,
  AssetNavigator,
  AssetRow,
  getAsset,
  useAssetsContext
} from '../../../asset';
import { ActionBar, useActionBarStatus } from '../../../asset/wind-turbine';
import {
  CREATE_MONITORING_POINT,
  getDataOfMonitoringPoint,
  getRealPoints,
  HistoryData,
  MONITORING_POINT_LIST
} from '../../../monitoring-point';
import { FlangeHistory } from '../history';
import { FlangeMonitoringPointList } from '../list';
import { FlangeMonitor } from '../monitor';
import { FlangeSet } from './settings';
import { FakeFlangeStatus } from '../status';
import intl from 'react-intl-universal';

export default function FlangeShow() {
  const { id } = useParams();
  const { state } = useLocation();
  const { assets, refresh } = useAssetsContext();
  const [flange, setFlange] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [tabKey, setTabKey] = React.useState('');
  const actionStatus = useActionBarStatus();
  const range = React.useRef<[number, number]>(oneWeekNumberRange);
  const historyDatas = useHistoryDatas(flange, range.current);

  const { hasPermission } = usePermission();

  const fetchFlange = (id: number) => {
    getAsset(id).then((flange) => {
      setLoading(false);
      setFlange(flange);
    });
  };

  React.useEffect(() => {
    fetchFlange(Number(id));
  }, [id]);

  if (loading) return <Spin />;
  if (flange === undefined) return <p>信息异常</p>;

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
          onDeleteSuccess={() => fetchFlange(Number(id))}
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
            fetchFlange(Number(id));
            refresh();
          }}
        />
      )
    });
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetNavigator
          id={flange.id}
          parentId={flange.parentId}
          assets={assets}
          from={state?.from}
        />
      </Col>
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
                    {intl.get(CREATE_MONITORING_POINT)}
                    <PlusOutlined />
                  </Button>
                ]}
                {...actionStatus}
                onSuccess={() => {
                  fetchFlange(Number(id));
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
