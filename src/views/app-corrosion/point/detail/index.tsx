import React from 'react';
import { TabsProps } from 'antd';
import intl from 'react-intl-universal';
import { Tabs } from '../../../../components';
import { DynamicData, MonitoringPointRow, TabBarExtraLeftContent } from '../../../asset-common';
import { Monitor } from './monitor';
import { History } from './history';
import { FilterableAlarmRecordTable } from '../../../../components/alarm/filterableAlarmRecordTable';
import usePermission, { Permission } from '../../../../permission/permission';
import { Settings } from './settings';
import { ThicknessWaveData, WaveformData } from './waveformData';
import { Analysis } from './analysis';
import { MonitoringPointTypeValue } from '../../../../config';

export const Index = (props: { monitoringPoint: MonitoringPointRow; onSuccess: () => void }) => {
  const { monitoringPoint, onSuccess } = props;
  const { hasPermission } = usePermission();
  const { alertLevel, id, type } = monitoringPoint;

  const items: TabsProps['items'] = [
    {
      key: 'real.time.data',
      label: intl.get('real.time.data'),
      children: <Monitor {...monitoringPoint} />
    },
    {
      key: 'history',
      label: intl.get('HISTORY_DATA'),
      children: <History {...monitoringPoint} />
    }
  ];

  items.push({
    key: 'waveformData',
    label: intl.get('WAVEFORM_DATA'),
    children: (
      <DynamicData<ThicknessWaveData>
        children={(values) => <WaveformData {...{ values }} />}
        dataType='waveform'
        id={id}
      />
    )
  });

  items.push({
    key: 'analysis',
    label: intl.get('ANALYSIS'),
    children: <Analysis {...monitoringPoint} />
  });

  items.push({
    key: 'alerts',
    label: intl.get('ALARM_RECORDS'),
    children: <FilterableAlarmRecordTable sourceId={id} storeKey='monitoringPointAlarmRecordList' />
  });
  if (hasPermission(Permission.MeasurementEdit)) {
    items.push({
      key: 'settings',
      label: intl.get('SETTINGS'),
      children: <Settings point={monitoringPoint} onUpdateSuccess={onSuccess} />
    });
  }

  return (
    <Tabs
      items={items}
      tabBarExtraContent={{
        left: (
          <TabBarExtraLeftContent
            id={id}
            label={MonitoringPointTypeValue[type]}
            alertLevel={alertLevel}
          />
        )
      }}
    />
  );
};
