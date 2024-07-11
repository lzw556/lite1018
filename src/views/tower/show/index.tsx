import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Spin, TabsProps } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import { TabsCard } from '../../../components/tabsCard';
import usePermission, { Permission } from '../../../permission/permission';
import { AssetAlarmStatistic, AssetRow, getAsset, useAssetsContext } from '../../asset';
import {
  getDataOfMonitoringPoint,
  getRealPoints,
  HistoryData,
  MONITORING_POINT,
  MONITORING_POINT_LIST
} from '../../monitoring-point';
import { TowerHistory } from './history';
import { TowerMonitoringPointList } from './list';
import { TowerSet } from './settings';
import intl from 'react-intl-universal';
import { useActionBarStatus } from '../../asset/common/useActionBarStatus';
import { ActionBar } from '../../asset/common/actionBar';

export default function TowerShow() {
  const { id } = useParams();
  const { refresh } = useAssetsContext();
  const [tower, setTower] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [tabKey, setTabKey] = React.useState('monitoringPointList');
  const actionStatus = useActionBarStatus();
  const range = React.useRef<[number, number]>(oneWeekNumberRange);
  const historyDatas = useHistoryDatas(tower, range.current);

  const { hasPermission } = usePermission();

  const fetchTower = (id: number) => {
    getAsset(id).then((tower) => {
      setLoading(false);
      setTower(tower);
    });
  };

  React.useEffect(() => {
    fetchTower(Number(id));
  }, [id]);

  if (loading) return <Spin />;
  if (tower === undefined) return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;

  const items: TabsProps['items'] = [
    {
      key: 'monitoringPointList',
      label: intl.get(MONITORING_POINT_LIST),
      children: (
        <TowerMonitoringPointList
          tower={tower}
          onUpdate={(point) => {
            actionStatus.onMonitoringPointUpdate?.(point);
          }}
          onDeleteSuccess={() => fetchTower(Number(id))}
        />
      )
    },
    {
      key: 'history',
      label: intl.get('HISTORY_DATA'),
      children: <TowerHistory tower={tower} historyDatas={historyDatas} key={tower.id} />
    }
  ];

  if (hasPermission(Permission.AssetEdit)) {
    items.push({
      key: 'settings',
      label: intl.get('SETTINGS'),
      children: (
        <TowerSet
          tower={tower}
          onUpdateSuccess={() => {
            fetchTower(Number(id));
            refresh();
          }}
        />
      )
    });
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetAlarmStatistic {...tower} />
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
                    onClick={() => actionStatus.onMonitoringPointCreate(tower)}
                  >
                    {intl.get('CREATE_SOMETHING', { something: intl.get(MONITORING_POINT) })}
                    <PlusOutlined />
                  </Button>
                ]}
                {...actionStatus}
                onSuccess={() => {
                  fetchTower(Number(id));
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

export function useHistoryDatas(tower?: AssetRow, range?: [number, number]) {
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryData; height?: number; radius?: number }[] | undefined
  >();
  React.useEffect(() => {
    const points = getRealPoints(tower?.monitoringPoints);
    if (points.length > 0 && range) {
      const [from, to] = range;
      const fetchs = points.map(({ id }) => getDataOfMonitoringPoint(id, from, to));
      Promise.all(fetchs).then((datas) =>
        setHistoryDatas(
          datas.map((data, index) => ({
            name: points[index].name,
            data,
            height: points[index].attributes?.tower_install_height,
            radius: points[index].attributes?.tower_base_radius
          }))
        )
      );
    }
  }, [tower, range]);
  return historyDatas;
}
