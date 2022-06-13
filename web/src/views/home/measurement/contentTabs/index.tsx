import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { MeasurementTypes } from '../../common/constants';
import { MeasurementRow } from '../props';
import { Alarm } from './alarm';
import { DynamicData } from './dynamicData';
import { HistoryData } from './historyData';
import { Monitor } from './monitor';

export const MeasurementContents: React.FC<MeasurementRow> = (measurement) => {
  const contents: Record<string, JSX.Element> = {
    monitor: <Monitor {...measurement} />,
    history: <HistoryData {...measurement} />,
    alarm: <Alarm {...measurement} />,
    dynamicData: <DynamicData {...measurement} />
  };
  const [key, setKey] = React.useState('monitor');
  const getTabList = () => {
    const tabList: { key: string; tab: string }[] = [
      { key: 'monitor', tab: '监控' },
      { key: 'history', tab: '历史数据' }
    ];

    if (measurement.type === MeasurementTypes.dynamicPreload.id) {
      tabList.push({ key: 'dynamicData', tab: '动态数据' });
    }
    // tabList.push({ key: 'alarmRecord', tab: '报警记录' });
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
