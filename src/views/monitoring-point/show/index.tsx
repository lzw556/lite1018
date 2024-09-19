import { Empty, TabsProps } from 'antd';
import React from 'react';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { TabsCard } from '../../../components/tabsCard';
import usePermission, { Permission } from '../../../permission/permission';
import { useAppConfigContext, useAssetsContext } from '../../asset';
import {
  INVALID_MONITORING_POINT,
  MonitoringPointRow,
  MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING,
  MonitoringPointTypeValue
} from '../types';
import { checkHasDynamicData, checkHasWaveData, isMonitoringPointVibration } from '../utils';
import { MonitoringPointSet } from './settings/index';
import intl from 'react-intl-universal';
import { MonitoringPointMonitor } from './monitor';
import { MonitoringPointHistory } from './history';
import { MonitoringPointDynamicData } from './dynamicData/dynamicData';
import { ThicknessAnalysis } from './thicknessAnalysis';
import { VibrationAnalysis } from '../vibration-analysis';

export default function MonitoringPointShow({
  monitoringPoint,
  fetchPoint
}: {
  monitoringPoint: MonitoringPointRow;
  fetchPoint: (id: number) => void;
}) {
  const { id } = monitoringPoint;
  const { refresh } = useAssetsContext();
  const { hasPermission } = usePermission();
  const appConfig = useAppConfigContext();
  if (
    monitoringPoint === undefined ||
    monitoringPoint.bindingDevices === undefined ||
    monitoringPoint.bindingDevices.length === 0
  )
    return (
      <Empty
        description={intl.get(INVALID_MONITORING_POINT)}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  const items: TabsProps['items'] = [
    {
      key: 'overview',
      label: intl.get('OVERVIEW'),
      children: <MonitoringPointMonitor {...monitoringPoint} />
    },
    {
      key: 'history',
      label: intl.get('HISTORY_DATA'),
      children: <MonitoringPointHistory {...monitoringPoint} />
    }
  ];
  if (
    monitoringPoint.type === MonitoringPointTypeValue.THICKNESS ||
    monitoringPoint.type === MonitoringPointTypeValue.THICKNESS_HIGH
  ) {
    items.push({
      key: 'analysis',
      label: intl.get('ANALYSIS'),
      children: <ThicknessAnalysis {...monitoringPoint} />
    });
  }
  if (isMonitoringPointVibration(monitoringPoint.type) && appConfig.analysisEnabled) {
    items.push({
      key: 'analysis',
      label: intl.get('intelligent.analysis'),
      children: <VibrationAnalysis />
    });
  }
  const config = MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING.get(monitoringPoint.type);
  if (
    checkHasDynamicData(monitoringPoint.type) &&
    (!isMonitoringPointVibration(monitoringPoint.type) || !appConfig.analysisEnabled)
  ) {
    items.push({
      key: 'dynamicData',
      label: intl.get(config?.dynamicData?.title ?? ''),
      children: (
        <MonitoringPointDynamicData
          key={monitoringPoint.id}
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
          key={monitoringPoint.id}
          {...monitoringPoint}
          dataType={config?.waveData?.serverDatatype}
        />
      )
    });
  }
  items.push({
    key: 'alerts',
    label: intl.get('ALARM_RECORDS'),
    children: (
      <FilterableAlarmRecordTable
        sourceId={monitoringPoint.id}
        storeKey='monitoringPointAlarmRecordList'
      />
    )
  });
  if (hasPermission(Permission.MeasurementEdit)) {
    items.push({
      key: 'settings',
      label: intl.get('SETTINGS'),
      children: (
        <MonitoringPointSet
          point={monitoringPoint}
          onUpdateSuccess={() => {
            fetchPoint(id);
            refresh();
          }}
        />
      )
    });
  }

  return <TabsCard items={items} />;
}
