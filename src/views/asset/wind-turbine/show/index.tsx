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
import { INVALID_WIND_TURBINE } from '../config';
import { getWinds } from '../common/utils';
import { CREATE_FLANGE, getFlanges } from '../../../flange';
import { WindTurbineMonitor } from './monitor';
import { WindTurbineMonitoringPointList } from './list';
import { WindTurbineSet } from './settings';
import { ActionBar } from '../common/actionBar';
import intl from 'react-intl-universal';

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
    { key: 'monitor', label: intl.get('MONITOR'), children: <WindTurbineMonitor {...wind} /> },
    {
      key: 'monitoringPointList',
      label: intl.get(MONITORING_POINT_LIST),
      children: (
        <ShadowCard>
          <WindTurbineMonitoringPointList
            wind={wind}
            onUpdate={(point) => {
              actionStatus.onMonitoringPointUpdate?.(point);
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
      label: intl.get('SETTINGS'),
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
                      {intl.get(CREATE_FLANGE)}
                      <PlusOutlined />
                    </Button>
                  ),
                  flanges.length > 0 && (
                    <Button
                      key='monitoring-point-create'
                      type='primary'
                      onClick={() => actionStatus.onMonitoringPointCreate(wind)}
                    >
                      {intl.get(CREATE_MONITORING_POINT)}
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
