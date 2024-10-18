import React from 'react';
import { TabsProps } from 'antd';
import intl from 'react-intl-universal';
import { Tabs } from '../../../../components';
import { FilterableAlarmRecordTable } from '../../../../components/alarm/filterableAlarmRecordTable';
import usePermission, { Permission } from '../../../../permission/permission';
import { MonitoringPointTypeValue } from '../../../../config';
import {
  DynamicData,
  MonitoringPointRow,
  Point,
  TabBarExtraLeftContent
} from '../../../asset-common';
import { Monitor } from './monitor';
import { History } from './history';
import { Preload } from './dynamic/preload';
import { Angle } from './dynamic/angle';
import { AngleBase } from './dynamic/angleBase';
import { PreloadWaveform } from './preloadWaveform';
import { Settings } from './settings';
import { AngleDynamicData, PreloadDynamicData, PreloadWaveData } from './dynamic/types';

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
  if (Point.Assert.isPreload(type)) {
    items.push({
      key: 'dynamicData',
      label: intl.get('DYNAMIC_DATA'),
      children: (
        <DynamicData<PreloadDynamicData>
          children={(values) => <Preload {...{ values }} />}
          dataType='raw'
          id={id}
        />
      )
    });
  } else if (type === MonitoringPointTypeValue.TOWER_INCLINATION) {
    items.push({
      key: 'dynamicData',
      label: intl.get('DYNAMIC_DATA'),
      children: (
        <DynamicData<AngleDynamicData>
          children={(values) => <Angle {...{ values, monitoringPoint }} />}
          dataType='raw'
          id={id}
        />
      )
    });
  } else if (type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT) {
    items.push({
      key: 'dynamicData',
      label: intl.get('DYNAMIC_DATA'),
      children: (
        <DynamicData<AngleDynamicData>
          children={(values) => <AngleBase {...{ values, monitoringPoint }} />}
          dataType='raw'
          id={id}
        />
      )
    });
  }
  if (Point.Assert.isPreload(type)) {
    items.push({
      key: 'waveformData',
      label: intl.get('WAVEFORM_DATA'),
      children: (
        <DynamicData<PreloadWaveData>
          children={(values) => <PreloadWaveform {...{ values }} />}
          dataType='waveform'
          id={id}
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
      tabsRighted={true}
    />
  );
};
