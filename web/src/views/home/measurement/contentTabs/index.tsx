import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { MeasurementRow } from '../props';
import { Alarm } from './alarm';
import { HistoryData } from './historyData';
import { Monitor } from './monitor';

export const MeasurementContents: React.FC<MeasurementRow> = (measurement) => {
  const contents: Record<string, JSX.Element> = {
    monitor: <Monitor {...measurement} />,
    history: <HistoryData {...measurement} />,
    alarm: <Alarm {...measurement} />
  };
  const [key, setKey] = React.useState('monitor');

  return (
    <ShadowCard
      tabList={[
        { key: 'monitor', tab: '监控' },
        { key: 'history', tab: '历史数据' },
        { key: 'alarm', tab: '报警记录' }
      ]}
      onTabChange={(key) => {
        setKey(key);
      }}
    >
      {key && contents[key]}
    </ShadowCard>
  );
};
