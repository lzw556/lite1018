import { Button, Col, Row, Spin, Tabs, TabsProps } from 'antd';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import usePermission, { Permission } from '../../../../permission/permission';
import { PlusOutlined } from '@ant-design/icons';
import ShadowCard from '../../../../components/shadowCard';
import { CREATE_MONITORING_POINT, MONITORING_POINT_LIST } from '../../../monitoring-point';
import { AssetAlarmStatistic, AssetNavigator, useAssetsContext } from '../../components';
import { AssetRow } from '../../types';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { getAsset } from '../../services';
import { INVALID_WIND_TURBINE } from '../common/types';
import { getWinds } from '../common/utils';
import { CREATE_FLANGE, getFlanges } from '../../../flange';
import { WindTurbineMonitor } from './monitor';
import { WindTurbineMonitoringPointList } from './list';
import { WindTurbineSet } from './settings';
import { ActionBar } from '../common/actionBar';

export default function WindTurbineShow() {
  const { id } = useParams();
  const { state } = useLocation();
  const { assets, refresh } = useAssetsContext();
  const [wind, setWind] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [tabKey, setTabKey] = React.useState('');
  const actionStatus = useActionBarStatus();
  const { hasPermission } = usePermission();

  const fetchWind = (id: number) => {
    getAsset(id).then((wind) => {
      setLoading(false);
      setWind(wind);
    });
  };

  React.useEffect(() => {
    fetchWind(Number(id));
  }, [id]);

  if (loading) return <Spin />;
  if (wind === undefined) return <p>{INVALID_WIND_TURBINE}</p>;

  const windTurbines = getWinds(assets);
  const flanges = getFlanges(assets);

  const items: TabsProps['items'] = [
    { key: 'monitor', label: '监控', children: <WindTurbineMonitor {...wind} /> },
    {
      key: 'monitoringPointList',
      label: MONITORING_POINT_LIST,
      children: (
        <ShadowCard>
          <WindTurbineMonitoringPointList
            wind={wind}
            onUpdate={(point) => {
              actionStatus.onMonitoringPointUpdate?.(point, flanges);
            }}
            onDeleteSuccess={() => {
              fetchWind(Number(id));
            }}
          />
        </ShadowCard>
      )
    }
  ];
  if (hasPermission(Permission.AssetEdit)) {
    items.push({
      key: 'settings',
      label: '配置信息',
      children: <WindTurbineSet {...wind} />
    });
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetNavigator id={wind.id} parentId={wind.parentId} assets={assets} from={state?.from} />
      </Col>
      <Col span={24}>
        <AssetAlarmStatistic {...wind} />
        <Tabs
          items={items}
          onChange={setTabKey}
          tabBarExtraContent={
            tabKey === 'monitoringPointList' && (
              <ActionBar
                hasPermission={hasPermission(Permission.AssetAdd)}
                actions={[
                  windTurbines.length > 0 && (
                    <Button
                      key='flange-create'
                      type='primary'
                      onClick={() => actionStatus.onFlangeCreate(Number(id))}
                    >
                      {CREATE_FLANGE}
                      <PlusOutlined />
                    </Button>
                  ),
                  flanges.length > 0 && (
                    <Button
                      key='monitoring-point-create'
                      type='primary'
                      onClick={() =>
                        actionStatus.onMonitoringPointCreate(
                          flanges.filter((f) => f.parentId === Number(id))
                        )
                      }
                    >
                      {CREATE_MONITORING_POINT}
                      <PlusOutlined />
                    </Button>
                  )
                ]}
                {...actionStatus}
                onSuccess={() => {
                  fetchWind(Number(id));
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
