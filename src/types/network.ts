import { Device } from './device';
import { Asset } from './asset';
import intl from 'react-intl-universal';

export type Network = {
  id: number;
  name: string;
  gateway: Device;
  asset: Asset;
  routingTables: [];
  nodes: Device[];
  communicationPeriod: number;
  communicationPeriod2: number;
  communicationOffset: number;
  groupSize: number;
  mode: number;
  groupSize2: number;
  intervalCnt: number;
};

export enum NetworkProvisioningMode {
  Mode1 = 1,
  Mode2,
  Mode3,
  Mode4,
  Mode5
}

export namespace NetworkProvisioningMode {
  export function toString(mode: NetworkProvisioningMode) {
    return intl.get(`WSN_MODE_OPTION_${mode}`);
  }
}
