import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Spin, TabsProps } from 'antd';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { checkIsFlangePreload, getFlanges } from '..';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import { TabsCard } from '../../../components/tabsCard';
import usePermission, { Permission } from '../../../permission/permission';
import {
  ActionBar,
  AssetAlarmStatistic,
  AssetNavigator,
  AssetRow,
  getAsset,
  getWinds,
  useActionBarStatus,
  useAssetsContext
} from '../../asset';
import {
  CREATE_MONITORING_POINT,
  getDataOfMonitoringPoint,
  getRealPoints,
  HistoryData,
  MONITORING_POINT_LIST
} from '../../monitoring-point';
import { FlangeHistory } from './history';
import { FlangeMonitoringPointList } from './list';
import { FlangeMonitor } from './monitor';
import { FlangeSet } from './settings';
import { FakeFlangeStatus } from './status';

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
      label: '监控',
      children: <FlangeMonitor flange={flange} historyDatas={historyDatas} />
    },
    {
      key: 'monitoringPointList',
      label: MONITORING_POINT_LIST,
      children: (
        <FlangeMonitoringPointList
          flange={flange}
          onUpdate={(point) => {
            actionStatus.onMonitoringPointUpdate?.(point, getFlanges(assets));
          }}
          onDeleteSuccess={() => fetchFlange(Number(id))}
        />
      )
    },
    {
      key: 'history',
      label: '历史数据',
      children: <FlangeHistory flange={flange} historyDatas={historyDatas} key={flange.id} />
    }
  ];
  if (checkIsFlangePreload(flange)) {
    items.push({
      key: 'flangeSatus',
      label: '法兰螺栓状态',
      children: <FakeFlangeStatus {...flange} />
    });
  }
  if (hasPermission(Permission.AssetEdit)) {
    items.push({
      key: 'settings',
      label: '配置信息',
      children: (
        <FlangeSet
          flange={flange}
          windTurbines={getWinds(assets)}
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
                    {CREATE_MONITORING_POINT}
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
