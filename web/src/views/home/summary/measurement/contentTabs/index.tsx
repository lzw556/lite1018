import * as React from 'react';
import { FilterableAlarmRecordTable } from '../../../../../components/alarm/filterableAlarmRecordTable';
import ShadowCard from '../../../../../components/shadowCard';
import usePermission, { Permission } from '../../../../../permission/permission';
import { MeasurementRow } from '../props';
import { DynamicData } from './dynamicData';
import { HistoryData } from './historyData';
import { Monitor } from './monitor';
import { MeasurementSettings } from './settings';
import * as AppConfig from '../../../../../config';

export const MeasurementContents: React.FC<MeasurementRow & { onUpdate?: () => void }> = (
  measurement
) => {
  const dynamicDataConfigs = AppConfig.getDynamicDataConfigs(measurement.type);
  const contents: Record<string, JSX.Element> = {
    monitor: <Monitor {...measurement} />,
    history: <HistoryData {...measurement} />,
    dynamicData: <DynamicData {...measurement} />,
    setting: <MeasurementSettings {...measurement} />,
    alarmRecord: <FilterableAlarmRecordTable sourceId={measurement.id} />
  };
  const [key, setKey] = React.useState('monitor');
  const { hasPermission } = usePermission();
  const getTabList = () => {
    const tabList: { key: string; tab: string }[] = [
      { key: 'monitor', tab: '监控' },
      { key: 'history', tab: '历史数据' }
    ];
    if (dynamicDataConfigs) tabList.push({ key: 'dynamicData', tab: '动态数据' });
    if (hasPermission(Permission.MeasurementEdit))
      tabList.push({ key: 'setting', tab: '配置信息' });
    tabList.push({ key: 'alarmRecord', tab: '报警记录' });
    return tabList;
  };

  return (
    <ShadowCard
      tabList={getTabList()}
      onTabChange={(key) => {
        setKey(key);
      }}
    >
      {key && contents[key]}
    </ShadowCard>
  );
};
