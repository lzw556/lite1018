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
  const { hasPermission } = usePermission();
  const getTabList = () => {
    const tabList: { key: string; tab: string; content: JSX.Element }[] = [
      { key: 'monitor', tab: '监控', content: <Monitor {...measurement} /> },
      { key: 'history', tab: '历史数据', content: <HistoryData {...measurement} /> }
    ];
    if (dynamicDataConfigs)
      tabList.push({
        key: 'dynamicData',
        tab: dynamicDataConfigs.title,
        content: <DynamicData {...measurement} />
      });
    if (hasPermission(Permission.MeasurementEdit))
      tabList.push({
        key: 'setting',
        tab: '配置信息',
        content: <MeasurementSettings {...measurement} />
      });
    tabList.push({
      key: 'alarmRecord',
      tab: '报警记录',
      content: <FilterableAlarmRecordTable sourceId={measurement.id} />
    });
    return tabList;
  };
  const tabList = getTabList();
  const [key, setKey] = React.useState(tabList.length > 0 ? tabList[0].key : 'monitor');

  return (
    <ShadowCard
      tabList={tabList}
      onTabChange={(key) => {
        setKey(key);
      }}
    >
      {key && tabList.find((tab) => tab.key === key)?.content}
    </ShadowCard>
  );
};
