import * as React from 'react';
import { Network } from '../../types/network';
import { DEFAULT_WSN_SETTING } from '../../types/wsn_setting';

type Wsn = {
  communication_period: number;
  communication_period_2: number;
  communication_offset: number;
  group_size: number;
  group_size_2: number;
  interval_cnt: number;
};

type Settings = {
  mode: number | undefined;
  wsn: Wsn;
};

export function useProvisionMode(
  network?: Network
): [
  number | undefined,
  React.Dispatch<React.SetStateAction<number | undefined>>,
  Settings | undefined
] {
  const [provisionMode, setProvisionMode] = React.useState<number | undefined>();
  const [settings, setSettings] = React.useState<Settings>();

  React.useEffect(() => {
    let wsn: Wsn = DEFAULT_WSN_SETTING;
    if (network && network.mode === provisionMode) {
      wsn = {
        communication_period: network.communicationPeriod,
        communication_period_2: network.communicationPeriod2,
        communication_offset: network.communicationOffset,
        group_size: network.groupSize,
        group_size_2: network.groupSize2,
        interval_cnt: network.intervalCnt
      };
    }
    setSettings({ mode: provisionMode, wsn });
  }, [provisionMode, network]);

  return [provisionMode, setProvisionMode, settings];
}
