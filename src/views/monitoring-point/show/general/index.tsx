import { Col, Empty, Row, Spin, TabsProps } from 'antd';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FilterableAlarmRecordTable } from '../../../../components/alarm/filterableAlarmRecordTable';
import { TabsCard } from '../../../../components/tabsCard';
import usePermission, { Permission } from '../../../../permission/permission';
import { useAssetsContext, AssetNavigator } from '../../../asset';
import { getMeasurement } from '../../services';
import {
  INVALID_MONITORING_POINT,
  MonitoringPointRow,
  MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING
} from '../../types';
import { checkHasDynamicData, checkHasWaveData } from '../../utils';
import { RelatedDevices } from '../device';
import { MonitoringPointDynamicData } from '../dynamicData/dynamicData';
import { MonitoringPointHistory } from '../history';
import { MonitoringPointMonitor } from '../monitor';
import { MonitoringPointSet } from './settings/index';
import intl from 'react-intl-universal';

export default function MonitoringPointShow() {
  const { id } = useParams();
  const { state } = useLocation();
  const { assets, refresh } = useAssetsContext();
  const [monitoringPoint, setMonitoringPoint] = React.useState<MonitoringPointRow>();
  const [loading, setLoading] = React.useState(true);

  const { hasPermission } = usePermission();

  const fetchPoint = (id: number) => {
    getMeasurement(id).then((point) => {
      setLoading(false);
      setMonitoringPoint(point);
    });
  };

  React.useEffect(() => {
    fetchPoint(Number(id));
  }, [id]);

  if (loading) return <Spin />;
  if (
    monitoringPoint === undefined ||
    monitoringPoint.bindingDevices === undefined ||
    monitoringPoint.bindingDevices.length === 0
  )
    return <Empty description={INVALID_MONITORING_POINT} image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const items: TabsProps['items'] = [
    {
      key: 'monitor',
      label: intl.get('MONITOR'),
      children: <MonitoringPointMonitor {...monitoringPoint} />
    },
    {
      key: 'history',
      label: intl.get('HISTORY_DATA'),
      children: <MonitoringPointHistory {...monitoringPoint} />
    }
  ];
  const config = MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING.get(monitoringPoint.type);
  if (checkHasDynamicData(monitoringPoint.type)) {
    items.push({
      key: 'dynamicData',
      label: intl.get(config?.dynamicData?.title ?? ''),
      children: (
        <MonitoringPointDynamicData
          {...monitoringPoint}
          dataType={config?.dynamicData?.serverDatatype}
        />
      )
    });
  }
  if (checkHasWaveData(monitoringPoint.type)) {
    items.push({
      key: 'waveData',
      label: intl.get(config?.waveData?.title ?? ''),
      children: (
        <MonitoringPointDynamicData
          {...monitoringPoint}
          dataType={config?.waveData?.serverDatatype}
        />
      )
    });
  }
  if (hasPermission(Permission.MeasurementEdit)) {
    items.push({
      key: 'settings',
      label: intl.get('SETTINGS'),
      children: (
        <MonitoringPointSet
          point={monitoringPoint}
          onUpdateSuccess={() => {
            fetchPoint(Number(id));
            refresh();
          }}
        />
      )
    });
  }
  items.push({
    key: 'alerts',
    label: intl.get('ALARM_RECORDS'),
    children: <FilterableAlarmRecordTable sourceId={monitoringPoint.id} />
  });
  console.log(state);
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetNavigator
          id={monitoringPoint.id}
          parentId={monitoringPoint.assetId}
          assets={assets}
          from={state?.from}
        />
      </Col>
      <Col span={24}>
        <RelatedDevices {...monitoringPoint} />
      </Col>
      <Col span={24}>
        <TabsCard items={items} />
      </Col>
    </Row>
  );
}
